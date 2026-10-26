import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { after } from "next/server";
import { isSupabaseServiceConfigured } from "@/lib/supabase-service";
import { buildRules, DECLINE_TAG } from "../prompt";
import type { ChatbotConfig } from "../types";
import { getKnowledge } from "./knowledge";
import { anthropicModel, stubModel, type ModelResult, type ModelTurn, type ReplyModel } from "./model";
import { memoryChatStore, supabaseChatStore, type ChatStore } from "./store";

// POST handler for the chat endpoint. Responses:
//   200 text/plain stream of the assistant's reply
//   400/403 { error: "bad_request" | "forbidden" }
//   429 { error: "rate_limited" }
//   503 { error: "offline" }
// Details are logged server-side only; nothing internal reaches the client.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(status: number, error: string) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

function originAllowed(config: ChatbotConfig, origin: string | null): boolean {
  if (!origin) return false;
  if (config.allowedOrigins.some((re) => re.test(origin))) return true;
  // This deployment's own Vercel URLs (covers previews under any project name).
  const own = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
    .filter(Boolean)
    .map((host) => `https://${host}`);
  return own.includes(origin);
}

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function textStream(text: string, headers: Record<string, string> = {}) {
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

type Deps = { store: ChatStore; model: ReplyModel; salt: string };

function resolveDeps(config: ChatbotConfig): Deps | null {
  if (process.env.CHAT_DEV_STUB === "1" && process.env.NODE_ENV !== "production") {
    return { store: memoryChatStore(), model: stubModel(), salt: process.env[config.env.ipSalt] || "dev-salt" };
  }
  const apiKey = process.env[config.env.apiKey];
  const salt = process.env[config.env.ipSalt];
  const missing = [
    !apiKey && config.env.apiKey,
    !salt && config.env.ipSalt,
    !isSupabaseServiceConfigured && "SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL",
  ].filter(Boolean);
  if (missing.length || !apiKey || !salt) {
    console.error(`chatbot: offline, missing env: ${missing.join(", ")}`);
    return null;
  }
  return { store: supabaseChatStore(), model: anthropicModel(config, apiKey), salt };
}

export async function handleChatRequest(request: Request, config: ChatbotConfig): Promise<Response> {
  if (!originAllowed(config, request.headers.get("origin"))) return json(403, "forbidden");

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, "bad_request");
  }
  if (!body || typeof body !== "object") return json(400, "bad_request");

  // Honeypot: real visitors never see or fill this field. Pretend it worked.
  if (typeof body.website === "string" && body.website !== "") {
    return textStream("Thanks for your message.");
  }

  const message = typeof body.message === "string" ? body.message.replace(/\r\n/g, "\n").trim() : "";
  if (!message || message.length > config.limits.maxMessageChars) return json(400, "bad_request");

  const rawPage = typeof body.page === "string" ? body.page : "/";
  const pagePath = rawPage.startsWith("/") && !rawPage.startsWith("//") ? rawPage.slice(0, 200) : "/";
  const sessionId =
    typeof body.sessionId === "string" && UUID_RE.test(body.sessionId) ? body.sessionId.toLowerCase() : randomUUID();

  const deps = resolveDeps(config);
  if (!deps) return json(503, "offline");
  const { store, model, salt } = deps;

  const ipHash = createHash("sha256").update(`${salt}:${clientIp(request)}`).digest("hex");
  const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 120);
  const base = { sessionId, ipHash, firstPage: pagePath, userAgent, pagePath };

  const { limits } = config;
  let turns: ModelTurn[];
  let knowledge: string;
  try {
    const counts = await store.rateCounts(ipHash, sessionId, limits.shortWindowMinutes);
    if (counts.globalDay >= limits.globalDay) {
      console.warn("chatbot: global daily cap reached", counts.globalDay);
      return json(429, "rate_limited");
    }
    if (counts.visitorShort >= limits.perVisitorShort || counts.visitorDay >= limits.perVisitorDay) {
      return json(429, "rate_limited");
    }

    await store.record({ ...base, role: "user", content: message });

    // History comes from the database, not the client, so a visitor can't
    // put words in the assistant's mouth.
    const history = await store.history(sessionId, limits.historyTurns * 2);
    while (history.length && history[0].role !== "user") history.shift();
    turns = history.map((m) => ({ role: m.role, content: m.content }));
    if (!turns.length) turns = [{ role: "user", content: message }];

    knowledge = await getKnowledge(config);
  } catch (err) {
    console.error("chatbot: request setup failed", err);
    return json(503, "offline");
  }

  if (Math.random() < limits.purgeChance) {
    after(() =>
      store.purge(limits.retentionDays).catch((err) => console.error("chatbot: purge failed", err)),
    );
  }

  const run = model({ rules: buildRules(config.persona), knowledge, turns });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";
      // Hold back output until we know whether it starts with DECLINE_TAG.
      let pending = "";
      let decided = false;
      let declined = false;
      // After the tag is stripped, the reply's leading whitespace may arrive
      // in a later chunk, so keep trimming until real text goes out.
      let trimLead = false;
      const emit = (s: string) => {
        if (trimLead) {
          s = s.trimStart();
          if (s) trimLead = false;
        }
        if (!s) return;
        full += s;
        controller.enqueue(encoder.encode(s));
      };
      const push = (chunk: string) => {
        if (decided) return emit(chunk);
        pending += chunk;
        const head = pending.trimStart();
        if (head.length < DECLINE_TAG.length && DECLINE_TAG.startsWith(head)) return;
        decided = true;
        if (head.startsWith(DECLINE_TAG)) {
          declined = true;
          trimLead = true;
          emit(head.slice(DECLINE_TAG.length));
        } else {
          emit(pending);
        }
      };

      let result: ModelResult | null = null;
      let failed = false;
      try {
        for await (const chunk of run.text) push(chunk);
        // A reply shorter than the tag that matched its start so far.
        if (!decided) {
          decided = true;
          emit(pending);
        }
        result = await run.result();
      } catch (err) {
        failed = true;
        console.error("chatbot: model stream failed", err);
      }

      const refused = result?.stopReason === "refusal";
      if (refused && !full.trim()) emit(config.ui.messages.refusal);
      if (failed) emit(full ? `\n\n${config.ui.messages.error}` : config.ui.messages.error);

      if (full.trim() && !failed) {
        try {
          await store.record({
            ...base,
            role: "assistant",
            content: full,
            model: config.model.id,
            inputTokens: result?.inputTokens,
            outputTokens: result?.outputTokens,
            cacheReadTokens: result?.cacheReadTokens,
            cacheWriteTokens: result?.cacheWriteTokens,
            flagged: declined || refused,
          });
        } catch (err) {
          console.error("chatbot: saving reply failed", err);
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      "X-Chat-Session": sessionId,
    },
  });
}

import type { Metadata } from "next";
import Link from "next/link";
import { chatbotConfig } from "@/features/chatbot/config";
import { createClient } from "@/lib/supabase-server";
import { deleteChatSession } from "./actions";

export const metadata: Metadata = { title: "Chats" };

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
  page_path: string | null;
  flagged: boolean;
};

type ChatSession = {
  id: string;
  created_at: string;
  last_message_at: string;
  first_page: string | null;
  message_count: number;
  chat_messages: ChatMessage[];
};

const RANGES = [7, 30, 90] as const;
const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function monthStartIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

function firstQuestion(s: { chat_messages: Pick<ChatMessage, "role" | "content">[] }): string | null {
  return s.chat_messages.find((m) => m.role === "user")?.content ?? null;
}

// Exact / near-duplicate grouping: lowercase, punctuation stripped,
// whitespace collapsed.
function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Denver",
  });
}

export default async function AdminChatsPage(props: PageProps<"/admin/chats">) {
  const params = await props.searchParams;
  const daysParam = Number(Array.isArray(params.days) ? params.days[0] : params.days);
  const days = (RANGES as readonly number[]).includes(daysParam) ? daysParam : 30;
  const flaggedOnly = params.flagged === "1";

  const supabase = await createClient();

  // Retention: purge anything past the window on every load (no cron).
  const retentionCutoff = daysAgoIso(chatbotConfig.limits.retentionDays);
  await supabase.from("chat_messages").delete().lt("created_at", retentionCutoff);
  await supabase.from("chat_sessions").delete().lt("last_message_at", retentionCutoff);

  const monthStart = monthStartIso();
  const cutoff = daysAgoIso(days);

  const [{ data: sessionData, error }, { data: monthData }] = await Promise.all([
    supabase
      .from("chat_sessions")
      .select(
        "id, created_at, last_message_at, first_page, message_count, chat_messages(role, content, created_at, page_path, flagged)",
      )
      .gte("last_message_at", cutoff)
      .order("last_message_at", { ascending: false })
      .order("created_at", { referencedTable: "chat_messages", ascending: true })
      .limit(300),
    supabase
      .from("chat_sessions")
      .select("id, chat_messages(role, content, created_at)")
      .gte("created_at", monthStart)
      .order("created_at", { referencedTable: "chat_messages", ascending: true })
      .limit(2000),
  ]);

  const sessions = ((sessionData ?? []) as ChatSession[])
    .map((s) => ({ ...s, flagged: s.chat_messages.some((m) => m.flagged) }))
    .filter((s) => !flaggedOnly || s.flagged);

  const groups = new Map<string, { label: string; count: number }>();
  for (const s of (monthData ?? []) as { chat_messages: Pick<ChatMessage, "role" | "content">[] }[]) {
    const q = firstQuestion(s);
    if (!q) continue;
    const key = normalizeQuestion(q);
    if (!key) continue;
    const g = groups.get(key) ?? { label: q, count: 0 };
    g.count++;
    groups.set(key, g);
  }
  const topQuestions = [...groups.values()].sort((a, b) => b.count - a.count).slice(0, 10);

  const filterHref = (d: number, f: boolean) => `/admin/chats?days=${d}${f ? "&flagged=1" : ""}`;
  const pill = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs transition-colors ${
      active ? "border-accent text-accent" : "border-line text-muted hover:text-foreground"
    }`;

  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Chats</h1>
      <p className="mt-2 text-sm text-muted">
        Conversations with the site&rsquo;s AI assistant. Kept for {chatbotConfig.limits.retentionDays} days,
        then deleted automatically. Flagged = the assistant declined (off-topic, politics, or an attempt to
        change its rules).
      </p>

      <section className="mt-8 rounded-lg border border-line bg-surface p-5">
        <h2 className="font-serif text-lg text-foreground">Top questions this month</h2>
        {topQuestions.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No chats yet this month.</p>
        ) : (
          <ol className="mt-3 space-y-2 text-sm">
            {topQuestions.map((q) => (
              <li key={q.label} className="flex items-baseline justify-between gap-4">
                <span className="min-w-0 text-foreground [overflow-wrap:anywhere]">{q.label}</span>
                <span className="shrink-0 text-xs text-muted">
                  {q.count} chat{q.count === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {RANGES.map((d) => (
          <Link key={d} href={filterHref(d, flaggedOnly)} className={pill(days === d)}>
            Last {d} days
          </Link>
        ))}
        <Link href={filterHref(days, !flaggedOnly)} className={pill(flaggedOnly)}>
          Flagged only
        </Link>
      </div>

      <p className="mt-4 text-sm text-muted">
        {sessions.length} chat{sessions.length === 1 ? "" : "s"}
        {flaggedOnly ? " flagged" : ""} in the last {days} days
      </p>
      {error && <p className="mt-2 text-sm text-red-400">Couldn&rsquo;t load chats: {error.message}</p>}

      <div className="mt-4 space-y-3">
        {sessions.map((s) => (
          <details key={s.id} className="group rounded-lg border border-line bg-surface">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 p-4">
              <span className="text-xs text-muted">{formatDateTime(s.created_at)}</span>
              {s.flagged && (
                <span className="rounded-full border border-red-400/60 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.1em] text-red-400">
                  Flagged
                </span>
              )}
              <span className="text-xs text-muted">
                {s.message_count} message{s.message_count === 1 ? "" : "s"}
                {s.first_page ? ` · from ${s.first_page}` : ""}
              </span>
              <span className="w-full text-sm text-foreground [overflow-wrap:anywhere]">
                {firstQuestion(s) ?? "(no question)"}
              </span>
            </summary>
            <div className="space-y-3 border-t border-line p-4">
              {s.chat_messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "pl-0" : "pl-4"}>
                  <p className="text-[0.65rem] uppercase tracking-[0.12em] text-muted">
                    {m.role === "user" ? "Visitor" : "Assistant"}
                    {m.flagged ? " · flagged" : ""} · {formatDateTime(m.created_at)}
                    {m.page_path ? ` · ${m.page_path}` : ""}
                  </p>
                  <p
                    className={`mt-1 whitespace-pre-wrap text-sm leading-6 [overflow-wrap:anywhere] ${
                      m.role === "user" ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {m.content}
                  </p>
                </div>
              ))}
              <form action={deleteChatSession.bind(null, s.id)} className="pt-2">
                <button
                  type="submit"
                  className="rounded-full border border-line px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-red-400 hover:text-red-400"
                >
                  Delete conversation
                </button>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

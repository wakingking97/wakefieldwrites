import "server-only";

import { createServiceClient } from "@/lib/supabase-service";

// Persistence behind one small interface, so another site can swap the
// backend. The Supabase version matches supabase/migrations/*_chat.sql.

export type RateCounts = { visitorShort: number; visitorDay: number; globalDay: number };

export type RecordInput = {
  sessionId: string;
  ipHash: string;
  firstPage: string;
  userAgent: string;
  role: "user" | "assistant";
  content: string;
  pagePath: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  flagged?: boolean;
};

export type StoredMessage = { role: "user" | "assistant"; content: string };

export interface ChatStore {
  rateCounts(ipHash: string, sessionId: string, shortMinutes: number): Promise<RateCounts>;
  record(input: RecordInput): Promise<void>;
  history(sessionId: string, limit: number): Promise<StoredMessage[]>;
  purge(days: number): Promise<void>;
}

export function supabaseChatStore(): ChatStore {
  const db = createServiceClient();
  return {
    async rateCounts(ipHash, sessionId, shortMinutes) {
      const { data, error } = await db
        .rpc("chat_rate_counts", { p_ip_hash: ipHash, p_session_id: sessionId, p_short_minutes: shortMinutes })
        .single<{ visitor_short: number; visitor_day: number; global_day: number }>();
      if (error) throw error;
      return {
        visitorShort: Number(data.visitor_short),
        visitorDay: Number(data.visitor_day),
        globalDay: Number(data.global_day),
      };
    },
    async record(m) {
      const { error } = await db.rpc("chat_record_message", {
        p_session_id: m.sessionId,
        p_ip_hash: m.ipHash,
        p_first_page: m.firstPage,
        p_user_agent: m.userAgent,
        p_role: m.role,
        p_content: m.content,
        p_page_path: m.pagePath,
        p_model: m.model ?? null,
        p_input_tokens: m.inputTokens ?? null,
        p_output_tokens: m.outputTokens ?? null,
        p_cache_read_tokens: m.cacheReadTokens ?? null,
        p_cache_write_tokens: m.cacheWriteTokens ?? null,
        p_flagged: m.flagged ?? false,
      });
      if (error) throw error;
    },
    async history(sessionId, limit) {
      const { data, error } = await db
        .from("chat_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return ((data ?? []) as StoredMessage[]).reverse();
    },
    async purge(days) {
      const { error } = await db.rpc("chat_purge_old", { p_days: days });
      if (error) throw error;
    },
  };
}

// Local development only (CHAT_DEV_STUB=1): lets the widget, streaming and
// rate limits be exercised without a service-role key. Lost on restart.
type MemRow = RecordInput & { at: number };
const memRows: MemRow[] = [];

export function memoryChatStore(): ChatStore {
  return {
    async rateCounts(ipHash, sessionId, shortMinutes) {
      const now = Date.now();
      const users = memRows.filter((r) => r.role === "user" && now - r.at < 24 * 3600_000);
      const mine = users.filter((r) => r.ipHash === ipHash || r.sessionId === sessionId);
      return {
        visitorShort: mine.filter((r) => now - r.at < shortMinutes * 60_000).length,
        visitorDay: mine.length,
        globalDay: users.length,
      };
    },
    async record(input) {
      memRows.push({ ...input, at: Date.now() });
    },
    async history(sessionId, limit) {
      return memRows
        .filter((r) => r.sessionId === sessionId)
        .slice(-limit)
        .map((r) => ({ role: r.role, content: r.content }));
    },
    async purge() {},
  };
}

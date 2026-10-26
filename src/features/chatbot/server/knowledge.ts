import "server-only";

import type { ChatbotConfig } from "../types";

// In-memory cache of the knowledge pack, rebuilt at most once per TTL per
// server instance. A failed rebuild keeps serving the previous pack.
let cached: { text: string; at: number } | null = null;
let inflight: Promise<string> | null = null;

export async function getKnowledge(config: ChatbotConfig): Promise<string> {
  if (cached && Date.now() - cached.at < config.limits.knowledgeTtlMs) return cached.text;
  if (inflight) return inflight;

  inflight = config
    .buildKnowledge()
    .then((text) => {
      cached = { text, at: Date.now() };
      return text;
    })
    .catch((err) => {
      console.error("chatbot: knowledge build failed", err);
      if (cached) return cached.text;
      throw err;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

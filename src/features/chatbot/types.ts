// Shapes shared by the chatbot module. Everything site-specific lives in
// config.ts; nothing in the components or server code names a site.

export type Corner = { right: number; bottom: number };

// Client-safe settings, passed to the widget as props by ChatbotMount.
export type ChatbotUi = {
  storageKey: string;
  title: string;
  tag: string;
  greeting: string;
  placeholder: string;
  starters: string[];
  smallPrint: string;
  privacyHref: string;
  privacyLabel: string;
  messages: {
    offline: string;
    rateLimited: string;
    error: string;
    // Shown if the model's own safety system declines with no text.
    refusal: string;
  };
  // CSS values (usually var(--token) references to the host site's theme).
  theme: {
    surface: string;
    background: string;
    foreground: string;
    muted: string;
    line: string;
    accent: string;
    accentText: string;
    headingFont: string;
    bodyFont: string;
  };
  hiddenPathPrefixes: string[];
  // Pages where the widget starts closed unless the visitor opened it
  // themselves (e.g. a checkout the open panel would cover).
  quietPaths: string[];
  // Elements the closed "?" button steps around (above or below) instead of
  // covering, e.g. checkout buttons.
  keepClearSelectors: string[];
  mobileBreakpoint: number;
  defaultCorner: { desktop: Corner; mobile: Corner };
  maxStoredMessages: number;
  maxMessageChars: number;
};

export type ChatbotLimits = {
  maxMessageChars: number;
  historyTurns: number;
  perVisitorShort: number;
  shortWindowMinutes: number;
  perVisitorDay: number;
  globalDay: number;
  knowledgeTtlMs: number;
  retentionDays: number;
  purgeChance: number;
};

export type ChatbotPersona = {
  siteName: string;
  siteDescription: string;
  ownerName: string;
  contactEmail: string;
  aboutPath: string;
  crisisLine: string;
};

export type ChatbotConfig = {
  ui: ChatbotUi;
  persona: ChatbotPersona;
  model: { id: string; maxTokens: number; effort: "low" | "medium" | "high" };
  // Env var NAMES (never values). The key is passed to the SDK explicitly
  // so it can never fall back to a different ANTHROPIC_API_KEY.
  env: { apiKey: string; ipSalt: string };
  limits: ChatbotLimits;
  allowedOrigins: RegExp[];
  // Server-only: returns the knowledge pack as plain text. Must be
  // deterministic for unchanged content so prompt caching keeps hitting.
  buildKnowledge: () => Promise<string>;
};

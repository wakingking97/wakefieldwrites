"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import RichText from "./RichText";
import styles from "./chatbot.module.css";
import type { ChatbotUi, Corner } from "./types";

type Msg = { role: "user" | "assistant" | "notice"; content: string };
type Stored = { open?: boolean; corner?: Corner; messages?: Msg[]; sessionId?: string };

// ---- storage (every access guarded: private mode, blocked storage, etc.) ----

function readStored(key: string): Stored {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    if (!parsed || typeof parsed !== "object") return {};
    const s = parsed as Record<string, unknown>;
    const corner = s.corner as Corner | undefined;
    return {
      open: typeof s.open === "boolean" ? s.open : undefined,
      corner:
        corner && Number.isFinite(corner.right) && Number.isFinite(corner.bottom)
          ? { right: corner.right, bottom: corner.bottom }
          : undefined,
      messages: Array.isArray(s.messages)
        ? (s.messages as Msg[]).filter(
            (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
          )
        : undefined,
      sessionId: typeof s.sessionId === "string" ? s.sessionId : undefined,
    };
  } catch {
    return {};
  }
}

function writeStored(key: string, value: Stored) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the widget still works for this page view.
  }
}

function newSessionId(): string | null {
  try {
    return crypto.randomUUID();
  } catch {
    return null; // the server assigns one
  }
}

// ---- viewport (also tells us we're on the client) ----

function subscribeViewport(cb: () => void) {
  window.addEventListener("resize", cb);
  window.addEventListener("orientationchange", cb);
  return () => {
    window.removeEventListener("resize", cb);
    window.removeEventListener("orientationchange", cb);
  };
}
const viewportSnapshot = () => `${window.innerWidth}x${window.innerHeight}`;
const serverViewportSnapshot = () => "0x0";

function panelSize(vw: number, vh: number, desktop: boolean) {
  return desktop
    ? { w: Math.min(360, vw - 16), h: Math.min(480, vh - 32) }
    : { w: Math.min(420, vw - 16), h: Math.min(560, Math.round(vh * 0.72)) };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, Math.max(lo, hi)));

export default function ChatWidget({ ui }: { ui: ChatbotUi }) {
  const pathname = usePathname() ?? "/";
  const viewport = useSyncExternalStore(subscribeViewport, viewportSnapshot, serverViewportSnapshot);
  const [vw, vh] = viewport.split("x").map(Number);
  const isClient = vw > 0;
  const isDesktop = vw >= ui.mobileBreakpoint;

  // Lazy initializers run on the client during hydration; nothing renders
  // until isClient, so the server and client markup still match.
  const [stored] = useState<Stored>(() => (typeof window === "undefined" ? {} : readStored(ui.storageKey)));
  const [userOpen, setUserOpen] = useState<boolean | null>(stored.open ?? null);
  const [corner, setCorner] = useState<Corner | null>(stored.corner ?? null);
  const [messages, setMessages] = useState<Msg[]>(stored.messages ?? []);
  const [sessionId, setSessionId] = useState<string | null>(stored.sessionId ?? null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "waiting" | "streaming">("idle");

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const focusAfter = useRef<"input" | "launcher" | null>(null);
  const suppressClick = useRef(false);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    start: Corner;
    moved: boolean;
  } | null>(null);

  const hidden = ui.hiddenPathPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const quiet = ui.quietPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  // First visit: open on desktop, closed on mobile and on quiet pages. Once
  // the visitor opens or closes it themselves, that choice wins everywhere.
  const open = userOpen ?? (isDesktop && !quiet);

  const size = open ? panelSize(vw, vh, isDesktop) : { w: isDesktop ? 52 : 44, h: isDesktop ? 52 : 44 };
  const base = corner ?? (isDesktop ? ui.defaultCorner.desktop : ui.defaultCorner.mobile);
  const placed: Corner = {
    right: clamp(base.right, 0, vw - size.w),
    bottom: clamp(base.bottom, 0, vh - size.h),
  };

  // The closed "?" steps above or below keep-clear elements (by the smaller
  // move) while one is under it, then settles back. Measured on scroll and
  // resize, since those elements move with the page.
  const [nudgedBottom, setNudgedBottom] = useState<number | null>(null);
  const shown: Corner = open || nudgedBottom === null ? placed : { ...placed, bottom: nudgedBottom };

  useEffect(() => {
    if (!isClient || open || !ui.keepClearSelectors.length) return;
    const selector = ui.keepClearSelectors.join(",");
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (drag.current) return;
      const left = vw - placed.right - size.w;
      const top = vh - placed.bottom - size.h;
      const gap = 8;
      let hitTop = Infinity;
      let hitBottom = -Infinity;
      document.querySelectorAll(selector).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const horizontal = r.left < left + size.w && left < r.right;
        const vertical = r.top < top + size.h + gap && top - gap < r.bottom;
        if (horizontal && vertical) {
          hitTop = Math.min(hitTop, r.top);
          hitBottom = Math.max(hitBottom, r.bottom);
        }
      });
      if (hitTop === Infinity) {
        setNudgedBottom(null);
        return;
      }
      const above = vh - hitTop + gap;
      const below = vh - hitBottom - gap - size.h;
      const options = [above, below].filter((b) => b >= 0 && b <= vh - size.h);
      if (!options.length) return setNudgedBottom(null);
      setNudgedBottom(options.reduce((a, b) => (Math.abs(a - placed.bottom) <= Math.abs(b - placed.bottom) ? a : b)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [isClient, open, ui.keepClearSelectors, vw, vh, placed.right, placed.bottom, size.w, size.h, pathname]);

  useEffect(() => {
    if (!isClient) return;
    writeStored(ui.storageKey, {
      ...(userOpen === null ? {} : { open: userOpen }),
      ...(corner ? { corner } : {}),
      messages: messages.filter((m) => m.role !== "notice").slice(-ui.maxStoredMessages),
      ...(sessionId ? { sessionId } : {}),
    });
  }, [isClient, ui.storageKey, ui.maxStoredMessages, userOpen, corner, messages, sessionId]);

  // Focus moves into the input on open and back to the "?" button on close
  // (only when the visitor did it, never on page load).
  useEffect(() => {
    if (focusAfter.current === "input" && open) inputRef.current?.focus();
    if (focusAfter.current === "launcher" && !open) launcherRef.current?.focus();
    focusAfter.current = null;
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status, open]);

  const openPanel = useCallback(() => {
    focusAfter.current = "input";
    setUserOpen(true);
  }, []);
  const closePanel = useCallback(() => {
    focusAfter.current = "launcher";
    setUserOpen(false);
  }, []);

  // ---- dragging (pointer events: mouse, pen and touch) ----

  const onDragStart = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    // Header buttons stay clickable; the launcher itself is a drag handle.
    if (target.closest("button") && target.closest("button") !== launcherRef.current) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, start: shown, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    d.moved = true;
    setNudgedBottom(null);
    setCorner({
      right: clamp(d.start.right - dx, 0, vw - size.w),
      bottom: clamp(d.start.bottom - dy, 0, vh - size.h),
    });
  };
  const onDragEnd = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    // A press that moved is a drag, so swallow the click that follows it.
    suppressClick.current = d.moved;
    drag.current = null;
  };
  const dragHandlers = {
    onPointerDown: onDragStart,
    onPointerMove: onDragMove,
    onPointerUp: onDragEnd,
    onPointerCancel: onDragEnd,
  };

  // ---- sending ----

  const busy = status !== "idle";

  async function send(text: string) {
    const question = text.trim().slice(0, ui.maxMessageChars);
    if (!question || busy) return;
    const sid = sessionId ?? newSessionId();
    if (sid !== sessionId) setSessionId(sid);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: question }]);
    setStatus("waiting");

    const notice = (content: string) => setMessages((m) => [...m, { role: "notice", content }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          sessionId: sid,
          page: pathname,
          website: honeypotRef.current?.value ?? "",
        }),
      });
      if (!res.ok || !res.body) {
        notice(
          res.status === 429 ? ui.messages.rateLimited : res.status === 503 ? ui.messages.offline : ui.messages.error,
        );
        return;
      }
      const assigned = res.headers.get("X-Chat-Session");
      if (assigned && assigned !== sid) setSessionId(assigned);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let started = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        if (!started) {
          started = true;
          setStatus("streaming");
          setMessages((m) => [...m, { role: "assistant", content: chunk }]);
        } else {
          setMessages((m) => {
            const copy = m.slice();
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, content: last.content + chunk };
            return copy;
          });
        }
      }
      if (!started) notice(ui.messages.error);
    } catch {
      notice(ui.messages.error);
    } finally {
      setStatus("idle");
    }
  }

  if (!isClient || hidden) return null;

  const themeVars = {
    "--cb-surface": ui.theme.surface,
    "--cb-background": ui.theme.background,
    "--cb-foreground": ui.theme.foreground,
    "--cb-muted": ui.theme.muted,
    "--cb-line": ui.theme.line,
    "--cb-accent": ui.theme.accent,
    "--cb-accent-text": ui.theme.accentText,
    "--cb-heading-font": ui.theme.headingFont,
    "--cb-body-font": ui.theme.bodyFont,
  } as CSSProperties;

  const position: CSSProperties = { right: shown.right, bottom: shown.bottom };

  if (!open) {
    return (
      <div className={styles.root} style={themeVars}>
        <button
          ref={launcherRef}
          type="button"
          className={styles.launcher}
          style={{ ...position, width: size.w, height: size.h }}
          aria-label={`Open chat: ${ui.title}`}
          aria-expanded={false}
          onClick={() => {
            if (suppressClick.current) {
              suppressClick.current = false;
              return;
            }
            openPanel();
          }}
          {...dragHandlers}
        >
          ?
        </button>
      </div>
    );
  }

  const empty = messages.length === 0;

  return (
    <div className={styles.root} style={themeVars}>
      <div
        ref={panelRef}
        role="dialog"
        aria-label={ui.title}
        className={styles.panel}
        style={{ ...position, width: size.w, height: size.h }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            closePanel();
          }
        }}
      >
        <div className={styles.header} {...dragHandlers}>
          <div className={styles.headerText}>
            <h2 className={styles.title}>{ui.title}</h2>
            <span className={styles.tag}>{ui.tag}</span>
          </div>
          <button type="button" className={styles.close} aria-label="Close chat" onClick={closePanel}>
            <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.closeIcon}>
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div
          ref={listRef}
          className={styles.list}
          role="log"
          aria-live="polite"
          aria-busy={busy}
          aria-label="Conversation"
        >
          <p className={`${styles.bubble} ${styles.assistant}`}>{ui.greeting}</p>
          {empty && (
            <div className={styles.chips}>
              {ui.starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={styles.chip}
                  aria-label={`Ask: ${s}`}
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "notice" ? (
              <p key={i} className={styles.notice}>
                <RichText text={m.content} linkClassName={styles.link} />
              </p>
            ) : (
              <p key={i} className={`${styles.bubble} ${m.role === "user" ? styles.user : styles.assistant}`}>
                {m.role === "assistant" ? <RichText text={m.content} linkClassName={styles.link} /> : m.content}
              </p>
            ),
          )}
          {status === "waiting" && (
            <p className={`${styles.bubble} ${styles.assistant} ${styles.typing}`} role="status" aria-label="Assistant is typing">
              <span />
              <span />
              <span />
            </p>
          )}
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <div aria-hidden="true" className={styles.honeypot}>
            <label htmlFor="chat-website">Website (leave blank)</label>
            <input ref={honeypotRef} id="chat-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <label htmlFor="chat-input" className={styles.srOnly}>
            Your question
          </label>
          <input
            ref={inputRef}
            id="chat-input"
            className={styles.input}
            type="text"
            value={input}
            maxLength={ui.maxMessageChars}
            placeholder={ui.placeholder}
            autoComplete="off"
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className={styles.send}
            aria-label="Send message"
            disabled={busy || !input.trim()}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.sendIcon}>
              <path d="M3 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
        <p className={styles.smallPrint}>
          {ui.smallPrint}{" "}
          <Link href={ui.privacyHref} className={styles.link}>
            {ui.privacyLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}

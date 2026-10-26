import Link from "next/link";
import type { ReactNode } from "react";

// Renders model output as plain text plus links, and nothing else: no raw
// HTML ever reaches the DOM. Understands [label](url), bare http(s) URLs and
// email addresses. Internal paths open in the same tab; external links open
// in a new tab with rel="noopener noreferrer". Any other scheme is shown as
// plain text.
const TOKEN_RE =
  /\[([^\]\n]{1,200})\]\(([^)\s]{1,500})\)|(https?:\/\/[^\s<>()[\]]*[^\s<>()[\].,;:!?'"])|([a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,})/gi;

type Href = { kind: "internal" | "external"; href: string };

function classify(raw: string): Href | null {
  if (/^\/(?!\/)/.test(raw)) return { kind: "internal", href: raw };
  if (/^mailto:[^\s]+$/i.test(raw)) return { kind: "external", href: raw };
  try {
    const url = new URL(raw);
    if (url.protocol === "https:" || url.protocol === "http:") return { kind: "external", href: url.toString() };
  } catch {
    // not a URL
  }
  return null;
}

function renderLink(key: number, label: string, target: Href | null, className: string): ReactNode {
  if (!target) return label;
  if (target.kind === "internal") {
    return (
      <Link key={key} href={target.href} className={className}>
        {label}
      </Link>
    );
  }
  const isMail = target.href.startsWith("mailto:");
  return (
    <a
      key={key}
      href={target.href}
      className={className}
      {...(isMail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
    >
      {label}
    </a>
  );
}

export default function RichText({ text, linkClassName }: { text: string; linkClassName: string }) {
  // Drop stray emphasis markers; the prompt asks for none.
  const clean = text.replace(/\*\*|__/g, "");
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of clean.matchAll(TOKEN_RE)) {
    const index = m.index ?? 0;
    if (index > last) out.push(clean.slice(last, index));
    if (m[1] !== undefined) {
      out.push(renderLink(key++, m[1], classify(m[2]), linkClassName));
    } else if (m[3] !== undefined) {
      out.push(renderLink(key++, m[3], classify(m[3]), linkClassName));
    } else if (m[4] !== undefined) {
      out.push(renderLink(key++, m[4], { kind: "external", href: `mailto:${m[4]}` }, linkClassName));
    }
    last = index + m[0].length;
  }
  if (last < clean.length) out.push(clean.slice(last));
  return <>{out}</>;
}

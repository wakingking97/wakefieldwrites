"use client";

import { useState } from "react";

export default function ShareButton({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // user cancelled or share failed -- fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable -- nothing more we can do silently
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="text-xs font-medium text-accent transition-colors hover:text-foreground"
    >
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ADMIN_FLASH_COOKIE, type AdminFlash } from "@/lib/adminFlashShared";

// Success banners fade after 5 seconds; failures stay 15 seconds so there's
// time to read the reason. Either can be closed early.
export default function AdminFlashBanner({ flash }: { flash: AdminFlash | null }) {
  const [dismissedId, setDismissedId] = useState<number | null>(null);
  const id = flash?.id ?? null;
  const type = flash?.type ?? null;

  useEffect(() => {
    if (id === null) return;
    document.cookie = `${ADMIN_FLASH_COOKIE}=; Max-Age=0; path=/admin`;
    const timer = setTimeout(() => setDismissedId(id), type === "error" ? 15000 : 5000);
    return () => clearTimeout(timer);
  }, [id, type]);

  if (!flash || flash.id === dismissedId) return null;

  const isError = flash.type === "error";
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        role={isError ? "alert" : "status"}
        aria-live={isError ? "assertive" : "polite"}
        className={`pointer-events-auto flex max-w-xl items-start gap-3 rounded-lg border bg-surface px-4 py-3 text-sm shadow-lg ${
          isError ? "border-red-400 text-red-300" : "border-accent text-foreground"
        }`}
      >
        <span aria-hidden className={`font-semibold ${isError ? "text-red-400" : "text-accent"}`}>
          {isError ? "✕" : "✓"}
        </span>
        <span>
          <span className="font-medium">{isError ? "Didn't go through. " : ""}</span>
          {flash.message}
        </span>
        <button
          type="button"
          onClick={() => setDismissedId(flash.id)}
          className="ml-2 text-muted transition-colors hover:text-foreground"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

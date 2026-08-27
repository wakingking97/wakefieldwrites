"use client";

import { useEffect, useRef } from "react";

/**
 * PLACEHOLDER PAYPAL INTEGRATION
 * ---------------------------------------------------------------
 * To go live:
 * 1. Get a PayPal "Buy Now" button from your PayPal Business
 *    account: https://www.paypal.com/buttons -> "Buy Now" ->
 *    configure the book/price -> it gives you a hosted button ID.
 * 2. Replace HOSTED_BUTTON_ID below with that ID.
 * 3. Replace PAYPAL_CLIENT_ID with your PayPal app's Client ID
 *    from https://developer.paypal.com/dashboard/applications
 * 4. Put both values in .env.local as
 *    NEXT_PUBLIC_PAYPAL_CLIENT_ID and
 *    NEXT_PUBLIC_PAYPAL_HOSTED_BUTTON_ID so they aren't hardcoded.
 * No backend/server code is required for a single hosted button —
 * PayPal handles the transaction entirely on their side.
 * ---------------------------------------------------------------
 */

const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "PLACEHOLDER_CLIENT_ID";
const HOSTED_BUTTON_ID =
  process.env.NEXT_PUBLIC_PAYPAL_HOSTED_BUTTON_ID ||
  "PLACEHOLDER_HOSTED_BUTTON_ID";

declare global {
  interface Window {
    paypal?: {
      HostedButtons: (config: { hostedButtonId: string }) => {
        render: (selector: string) => void;
      };
    };
  }
}

export default function PayPalButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (rendered.current) return;

    const isConfigured =
      PAYPAL_CLIENT_ID !== "PLACEHOLDER_CLIENT_ID" &&
      HOSTED_BUTTON_ID !== "PLACEHOLDER_HOSTED_BUTTON_ID";

    if (!isConfigured) return;

    const scriptId = "paypal-sdk";
    const existing = document.getElementById(scriptId);

    const renderButton = () => {
      if (window.paypal && containerRef.current && !rendered.current) {
        window.paypal
          .HostedButtons({ hostedButtonId: HOSTED_BUTTON_ID })
          .render(`#${containerRef.current.id}`);
        rendered.current = true;
      }
    };

    if (existing) {
      renderButton();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&components=hosted-buttons&currency=USD`;
    script.onload = renderButton;
    document.body.appendChild(script);
  }, []);

  const isConfigured =
    PAYPAL_CLIENT_ID !== "PLACEHOLDER_CLIENT_ID" &&
    HOSTED_BUTTON_ID !== "PLACEHOLDER_HOSTED_BUTTON_ID";

  if (!isConfigured) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface p-6 text-sm text-muted">
        <p className="font-medium text-foreground">
          PayPal button not configured yet.
        </p>
        <p className="mt-2">
          Add <code className="text-accent">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>{" "}
          and{" "}
          <code className="text-accent">
            NEXT_PUBLIC_PAYPAL_HOSTED_BUTTON_ID
          </code>{" "}
          to <code className="text-accent">.env.local</code> — see the
          comment at the top of{" "}
          <code className="text-accent">src/components/PayPalButton.tsx</code>{" "}
          for exact steps.
        </p>
        <a
          href="https://www.amazon.com/dp/B0H2HL3WDK"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Buy on Amazon instead
        </a>
      </div>
    );
  }

  return <div id="paypal-button-container" ref={containerRef} />;
}

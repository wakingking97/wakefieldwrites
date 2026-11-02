import { createClient } from "@supabase/supabase-js";

// SUPABASE_SERVICE_ROLE_KEY bypasses RLS entirely -- server-only, never
// NEXT_PUBLIC_, never imported by a client component. Only for trusted
// server-only code with no end-user Supabase Auth session to lean on for
// RLS (the PayPal webhook, the chat API, the insights jobs), or admin
// Server Actions *after* they've checked the admin session themselves.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseServiceConfigured = Boolean(url && serviceRoleKey);

export function createServiceClient() {
  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL not configured",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

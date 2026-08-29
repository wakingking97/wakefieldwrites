import { createClient } from "@supabase/supabase-js";

// SUPABASE_SERVICE_ROLE_KEY bypasses RLS entirely -- server-only, never
// NEXT_PUBLIC_, never imported by a client component. This exists
// exclusively for the PayPal webhook route handler, which writes
// orders/inventory from a trusted server-to-server call with no
// end-user Supabase Auth session to lean on for RLS.
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

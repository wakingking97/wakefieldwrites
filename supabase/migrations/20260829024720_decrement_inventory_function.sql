-- BASELINE: already applied to the live database on 2026-08-29 (version
-- 20260829024720 in supabase_migrations.schema_migrations). Copied verbatim from
-- the live migration history on 2026-11-02 so the repo matches the
-- database. Do not re-run.

-- Atomic relative decrement (single UPDATE, no read-then-write race)
-- for the PayPal webhook to call after recording an order.
create or replace function decrement_inventory(p_format text, p_qty integer)
returns void
language sql
set search_path = public
as $$
  update inventory
  set signed_copies_on_hand = signed_copies_on_hand - p_qty,
      updated_at = now()
  where format = p_format;
$$;

-- Postgres grants EXECUTE on new functions to PUBLIC by default, which
-- Supabase's anon/authenticated roles inherit -- explicitly lock this
-- down so only the service_role (used exclusively by the webhook route
-- handler, server-side only) can call it.
revoke all on function decrement_inventory(text, integer) from public;
revoke all on function decrement_inventory(text, integer) from anon, authenticated;
grant execute on function decrement_inventory(text, integer) to service_role;

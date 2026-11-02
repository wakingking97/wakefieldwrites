-- BASELINE: already applied to the live database on 2026-08-29 (version
-- 20260829024506 in supabase_migrations.schema_migrations). Copied verbatim from
-- the live migration history on 2026-11-02 so the repo matches the
-- database. Do not re-run.

create table if not exists orders (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  paypal_order_id text not null unique,
  format text not null check (format in ('paperback', 'hardcover')),
  quantity integer not null default 1,
  buyer_name text,
  buyer_email text,
  shipping_address jsonb,
  amount numeric(10,2),
  currency text default 'USD',
  status text not null default 'completed'
);

alter table orders enable row level security;

-- Only the admin (authenticated) can read orders -- they contain buyer
-- PII. Writes happen exclusively from the PayPal webhook route handler
-- using the service_role key server-side, which bypasses RLS entirely,
-- so there is deliberately no insert/update policy here at all.
create policy "Authenticated users can read orders"
on orders for select
to authenticated
using (true);

create table if not exists inventory (
  format text primary key check (format in ('paperback', 'hardcover')),
  signed_copies_on_hand integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table inventory enable row level security;

create policy "Authenticated users can read inventory"
on inventory for select
to authenticated
using (true);

-- Placeholder rows so the primary keys exist and the admin/orders page
-- has something to read -- NOT real counts. Kyler needs to confirm his
-- actual on-hand signed paperback/hardcover counts and this needs
-- updating before the site goes live with real inventory tracking.
insert into inventory (format, signed_copies_on_hand) values
  ('paperback', 0),
  ('hardcover', 0)
on conflict (format) do nothing;

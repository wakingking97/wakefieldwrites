-- PayPal order webhook go-live fixes (prompts/paypal-webhook-fixes.md).
--
-- 1. Three signed-copy formats instead of two. The /book button offers
--    "Paperback", "Hardcover Case Laminate" and "Hardcover w/Paper Sleeve",
--    and Kyler stocks the two hardcovers separately.
-- 2. Orders are always recorded. format is null when the webhook couldn't
--    tell which edition was bought ("unconfirmed"); raw_item keeps what
--    PayPal actually sent so Kyler can set it by hand.
-- 3. Inventory is applied exactly once per order (inventory_applied), never
--    clamped, and a sale that takes stock below zero records the shortfall
--    on the order instead of failing.
-- 4. Kyler can correct on-hand counts by hand (authenticated UPDATE policy).
-- 5. Real on-hand counts (Kyler, 2026-11-02).
--
-- Applied with `supabase db query --linked -f` on 2026-11-02.

-- ---------------------------------------------------------------------------
-- Formats
-- ---------------------------------------------------------------------------

alter table public.orders drop constraint orders_format_check;
alter table public.inventory drop constraint inventory_format_check;

-- No orders existed when this ran (count 0), and the only inventory rows
-- were the 0/0 placeholders, so there is no data to carry over.
delete from public.inventory where format = 'hardcover';

alter table public.orders
  alter column format drop not null,
  add constraint orders_format_check
    check (format is null or format in ('paperback', 'hardcover_laminate', 'hardcover_sleeve'));

alter table public.inventory
  add constraint inventory_format_check
    check (format in ('paperback', 'hardcover_laminate', 'hardcover_sleeve'));

insert into public.inventory (format, signed_copies_on_hand, updated_at) values
  ('paperback', 10, now()),
  ('hardcover_laminate', 5, now()),
  ('hardcover_sleeve', 1, now())
on conflict (format) do update
  set signed_copies_on_hand = excluded.signed_copies_on_hand,
      updated_at = excluded.updated_at;

-- ---------------------------------------------------------------------------
-- Order columns
-- ---------------------------------------------------------------------------

alter table public.orders
  -- Item name / description / SKU exactly as PayPal sent them.
  add column raw_item text,
  -- True once this order's quantity has been subtracted from inventory.
  -- Guards against double decrements (retries, manual format fixes).
  add column inventory_applied boolean not null default false,
  -- Copies short when this order was applied (0 = was in stock).
  add column shortfall integer not null default 0,
  add column format_set_manually_at timestamptz;

-- ---------------------------------------------------------------------------
-- Exactly-once inventory application
-- ---------------------------------------------------------------------------

-- Subtracts the order's quantity from its format's on-hand count, once.
-- Never clamps: the count may go negative, and the shortfall is recorded on
-- the order so /admin can warn. Returns the new on-hand count, or null if
-- nothing was applied (already applied, or format still unconfirmed).
-- Raises if the format has no inventory row, which also rolls back the
-- inventory_applied flag so the order can be applied later.
create function public.apply_order_inventory(p_order_id bigint)
returns integer
language plpgsql
set search_path = public
as $$
declare
  v_format text;
  v_qty integer;
  v_on_hand integer;
begin
  update orders
  set inventory_applied = true
  where id = p_order_id
    and not inventory_applied
    and format is not null
  returning format, quantity into v_format, v_qty;

  if not found then
    return null;
  end if;

  update inventory
  set signed_copies_on_hand = signed_copies_on_hand - v_qty,
      updated_at = now()
  where format = v_format
  returning signed_copies_on_hand into v_on_hand;

  if not found then
    raise exception 'No inventory row for format %', v_format;
  end if;

  if v_on_hand < 0 then
    update orders
    set shortfall = least(v_qty, -v_on_hand)
    where id = p_order_id;
  end if;

  return v_on_hand;
end;
$$;

-- Sets the format on a flagged (unconfirmed) order and applies inventory.
-- Only works while format is null and inventory hasn't been applied, so it
-- can never decrement an order twice. Returns the new on-hand count, or
-- null if the order wasn't eligible.
create function public.set_order_format(p_order_id bigint, p_format text)
returns integer
language plpgsql
set search_path = public
as $$
begin
  update orders
  set format = p_format,
      format_set_manually_at = now()
  where id = p_order_id
    and format is null
    and not inventory_applied;

  if not found then
    return null;
  end if;

  return apply_order_inventory(p_order_id);
end;
$$;

-- Same lockdown as decrement_inventory: Postgres grants EXECUTE to PUBLIC by
-- default. Only service_role (the webhook, and admin Server Actions after
-- they check the admin session) may call these.
revoke all on function public.apply_order_inventory(bigint) from public, anon, authenticated;
revoke all on function public.set_order_format(bigint, text) from public, anon, authenticated;
grant execute on function public.apply_order_inventory(bigint) to service_role;
grant execute on function public.set_order_format(bigint, text) to service_role;

-- decrement_inventory (20260829024720) is no longer called by the new
-- webhook code. It's kept so the deployment that predates this migration
-- keeps working until the new code is pushed. Safe to drop after that.

-- ---------------------------------------------------------------------------
-- Manual inventory edits + tighter grants
-- ---------------------------------------------------------------------------

-- Admin policy. The accounts build (prompts/user-accounts.md) will switch
-- this from "any authenticated user" to is_admin().
create policy "Admin can update inventory counts"
on public.inventory for update
to authenticated
using (true)
with check (true);

-- Supabase's default grants gave anon and authenticated every table
-- privilege on these tables, leaving RLS as the only barrier. Narrow them
-- to what the policies actually allow (same fix as insights and chat).
-- No behavior change: RLS already blocked everything removed here.
revoke all on public.orders from anon;
revoke all on public.inventory from anon;
revoke all on public.orders from authenticated;
revoke all on public.inventory from authenticated;
grant select on public.orders to authenticated;
grant select on public.inventory to authenticated;
grant update (signed_copies_on_hand, updated_at) on public.inventory to authenticated;

-- Database tests for orders/inventory (20261102000000_orders_safety_three_formats).
-- Safe to run against the live project: everything happens inside one
-- transaction that is rolled back at the end, so no test rows survive.
--
--   supabase db query --linked -f supabase/tests/orders_inventory_test.sql
--
-- Any failed check raises an exception, so the run errors out. A clean run
-- ends by selecting 'ALL PASSED'.

begin;

-- Start from known counts so the assertions don't depend on live stock.
update inventory set signed_copies_on_hand = 10 where format = 'paperback';
update inventory set signed_copies_on_hand = 5 where format = 'hardcover_laminate';
update inventory set signed_copies_on_hand = 1 where format = 'hardcover_sleeve';

do $$
declare
  v_id bigint;
  v_dup bigint;
  v_result integer;
  v_count integer;
  v_order orders%rowtype;
begin
  -- 1. Known format: records and decrements once.
  insert into orders (paypal_order_id, format, quantity, raw_item)
  values ('TEST-KNOWN', 'paperback', 1, 'name: Paperback')
  returning id into v_id;
  v_result := apply_order_inventory(v_id);
  if v_result is distinct from 9 then
    raise exception 'FAIL known format: expected 9 on hand, got %', v_result;
  end if;
  select * into v_order from orders where id = v_id;
  if not v_order.inventory_applied or v_order.shortfall <> 0 then
    raise exception 'FAIL known format: applied/shortfall wrong';
  end if;

  -- 2. Duplicate retry: same PayPal order id inserts nothing, and applying
  --    the original order again changes nothing.
  insert into orders (paypal_order_id, format, quantity)
  values ('TEST-KNOWN', 'paperback', 1)
  on conflict (paypal_order_id) do nothing
  returning id into v_dup;
  if v_dup is not null then
    raise exception 'FAIL duplicate: second insert was not ignored';
  end if;
  if apply_order_inventory(v_id) is not null then
    raise exception 'FAIL duplicate: order applied twice';
  end if;
  select signed_copies_on_hand into v_count from inventory where format = 'paperback';
  if v_count <> 9 then
    raise exception 'FAIL duplicate: paperback is %, expected 9', v_count;
  end if;

  -- 3. Unknown format: recorded with format null, no decrement.
  insert into orders (paypal_order_id, format, quantity, raw_item)
  values ('TEST-UNKNOWN', null, 1, 'name: Signed copy')
  returning id into v_id;
  if apply_order_inventory(v_id) is not null then
    raise exception 'FAIL unknown format: inventory was applied';
  end if;
  select sum(signed_copies_on_hand) into v_count from inventory;
  if v_count <> 9 + 5 + 1 then
    raise exception 'FAIL unknown format: inventory changed (total %)', v_count;
  end if;

  -- 4. Manual format fix on the flagged order: decrements exactly once.
  v_result := set_order_format(v_id, 'hardcover_laminate');
  if v_result is distinct from 4 then
    raise exception 'FAIL manual fix: expected 4 laminate on hand, got %', v_result;
  end if;
  if set_order_format(v_id, 'hardcover_laminate') is not null
     or set_order_format(v_id, 'paperback') is not null
     or apply_order_inventory(v_id) is not null then
    raise exception 'FAIL manual fix: second fix was allowed';
  end if;
  select signed_copies_on_hand into v_count from inventory where format = 'hardcover_laminate';
  if v_count <> 4 then
    raise exception 'FAIL manual fix: laminate is %, expected 4', v_count;
  end if;
  select signed_copies_on_hand into v_count from inventory where format = 'paperback';
  if v_count <> 9 then
    raise exception 'FAIL manual fix: paperback changed to %', v_count;
  end if;
  select * into v_order from orders where id = v_id;
  if v_order.format_set_manually_at is null then
    raise exception 'FAIL manual fix: format_set_manually_at not set';
  end if;

  -- 5. Stock below zero: recorded, count goes negative, shortfall stored.
  insert into orders (paypal_order_id, format, quantity)
  values ('TEST-OVERSOLD', 'hardcover_sleeve', 3)
  returning id into v_id;
  v_result := apply_order_inventory(v_id);
  if v_result is distinct from -2 then
    raise exception 'FAIL oversold: expected -2 on hand, got %', v_result;
  end if;
  select * into v_order from orders where id = v_id;
  if v_order.shortfall <> 2 or not v_order.inventory_applied then
    raise exception 'FAIL oversold: shortfall % (expected 2)', v_order.shortfall;
  end if;

  -- 6. Format check constraint still rejects the old two-value format.
  begin
    insert into orders (paypal_order_id, format) values ('TEST-OLD', 'hardcover');
    raise exception 'FAIL constraint: old ''hardcover'' format accepted';
  exception when check_violation then null;
  end;
end $$;

-- RLS / grants ---------------------------------------------------------------

do $$
begin
  -- anon: no read or write on either table.
  begin
    set local role anon;
    perform 1 from orders;
    raise exception 'FAIL rls: anon could read orders';
  exception when insufficient_privilege then null;
  end;
  begin
    set local role anon;
    perform 1 from inventory;
    raise exception 'FAIL rls: anon could read inventory';
  exception when insufficient_privilege then null;
  end;
  begin
    set local role anon;
    insert into orders (paypal_order_id, format) values ('TEST-ANON', 'paperback');
    raise exception 'FAIL rls: anon could insert orders';
  exception when insufficient_privilege then null;
  end;
  begin
    set local role anon;
    update inventory set signed_copies_on_hand = 99;
    raise exception 'FAIL rls: anon could update inventory';
  exception when insufficient_privilege then null;
  end;
  begin
    set local role anon;
    perform apply_order_inventory(1);
    raise exception 'FAIL rls: anon could call apply_order_inventory';
  exception when insufficient_privilege then null;
  end;

  -- authenticated: can read both and update inventory counts, nothing else.
  begin
    set local role authenticated;
    insert into orders (paypal_order_id, format) values ('TEST-AUTH', 'paperback');
    raise exception 'FAIL rls: authenticated could insert orders';
  exception when insufficient_privilege then null;
  end;
  begin
    set local role authenticated;
    update orders set format = 'paperback';
    raise exception 'FAIL rls: authenticated could update orders';
  exception when insufficient_privilege then null;
  end;
  begin
    set local role authenticated;
    delete from orders;
    raise exception 'FAIL rls: authenticated could delete orders';
  exception when insufficient_privilege then null;
  end;
  begin
    set local role authenticated;
    insert into inventory (format) values ('paperback');
    raise exception 'FAIL rls: authenticated could insert inventory';
  exception when insufficient_privilege then null;
  end;
  begin
    set local role authenticated;
    delete from inventory;
    raise exception 'FAIL rls: authenticated could delete inventory';
  exception when insufficient_privilege then null;
  end;
  begin
    set local role authenticated;
    perform set_order_format(1, 'paperback');
    raise exception 'FAIL rls: authenticated could call set_order_format';
  exception when insufficient_privilege then null;
  end;
end $$;

set local role authenticated;
do $$
declare
  v_rows integer;
begin
  perform 1 from orders limit 1;
  update inventory set signed_copies_on_hand = 7, updated_at = now()
  where format = 'paperback';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'FAIL rls: authenticated inventory update hit % rows', v_rows;
  end if;
end $$;
reset role;

select 'ALL PASSED' as result;

rollback;

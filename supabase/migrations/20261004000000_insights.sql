create table public.insights (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  hook_content text not null,
  keywords text[] not null default '{}',
  meta_description text not null,
  substack_url text not null,
  substack_title text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz
);

create index insights_status_published_at_idx
  on public.insights (status, published_at desc);

alter table public.insights enable row level security;

-- Public: published rows only, read-only.
create policy "Anyone can read published insights"
  on public.insights for select to anon
  using (status = 'published');

-- Admin (single Supabase Auth account): full access, same model as reviews.
create policy "Authenticated users can read all insights"
  on public.insights for select to authenticated using (true);
create policy "Authenticated users can create insights"
  on public.insights for insert to authenticated with check (true);
create policy "Authenticated users can update insights"
  on public.insights for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete insights"
  on public.insights for delete to authenticated using (true);

-- The /api/insights/draft route writes with the service_role key, which
-- bypasses RLS -- deliberately no anon write policy exists.

-- Belt-and-suspenders: Supabase grants anon broad table privileges by
-- default (RLS is the only thing stopping writes). Strip them down to SELECT.
revoke all on public.insights from anon;
grant select on public.insights to anon;

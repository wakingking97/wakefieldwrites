-- BASELINE: already applied to the live database on 2026-08-29 (version
-- 20260829024451 in supabase_migrations.schema_migrations). Copied verbatim from
-- the live migration history on 2026-11-02 so the repo matches the
-- database. Do not re-run.

-- Grants the single authenticated admin user (Supabase Auth session,
-- no public sign-up exists) permission to moderate reviews. The anon
-- key keeps its existing insert-only + approved-only-read policies.

create policy "Authenticated users can read all reviews"
on reviews for select
to authenticated
using (true);

create policy "Authenticated users can approve reviews"
on reviews for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can reject reviews"
on reviews for delete
to authenticated
using (true);

alter table public.insights
  add column category text not null default 'substack'
    check (category in ('substack', 'book', 'author'));

-- Non-Substack posts (book/author news) have no source post.
alter table public.insights alter column substack_url drop not null;
alter table public.insights alter column substack_title drop not null;

alter table public.insights add constraint insights_substack_fields_check
  check (category <> 'substack' or (substack_url is not null and substack_title is not null));

-- RLS and grants are table-level and unchanged: anon SELECT published only,
-- authenticated full CRUD, service role bypasses RLS.

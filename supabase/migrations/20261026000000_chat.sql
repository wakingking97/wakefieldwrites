-- Site chat assistant (src/features/chatbot). Visitors never touch these
-- tables directly: /api/chat writes with the service_role key, and the
-- admin (single Supabase Auth account) can read and delete.

create table public.chat_sessions (
  id uuid primary key,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  -- Salted SHA-256 of the visitor's IP. Never the raw IP.
  ip_hash text not null,
  first_page text,
  user_agent_short text,
  message_count integer not null default 0
);

create index chat_sessions_last_message_at_idx on public.chat_sessions (last_message_at desc);
create index chat_sessions_ip_hash_idx on public.chat_sessions (ip_hash);

create table public.chat_messages (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  created_at timestamptz not null default now(),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  page_path text,
  model text,
  input_tokens integer,
  output_tokens integer,
  -- Not in the original spec: prompt-cache reads/writes, so cost can be
  -- worked out exactly (input_tokens is only the uncached remainder).
  cache_read_tokens integer,
  cache_write_tokens integer,
  flagged boolean not null default false
);

create index chat_messages_session_idx on public.chat_messages (session_id, created_at);
create index chat_messages_created_role_idx on public.chat_messages (created_at desc, role);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- Admin: read + delete only. No insert/update policy for anyone; the API
-- route writes with service_role, which bypasses RLS.
create policy "Authenticated users can read chat sessions"
  on public.chat_sessions for select to authenticated using (true);
create policy "Authenticated users can delete chat sessions"
  on public.chat_sessions for delete to authenticated using (true);
create policy "Authenticated users can read chat messages"
  on public.chat_messages for select to authenticated using (true);
create policy "Authenticated users can delete chat messages"
  on public.chat_messages for delete to authenticated using (true);

-- Supabase grants anon/authenticated broad table privileges by default.
-- anon gets nothing at all; authenticated gets exactly read + delete.
revoke all on public.chat_sessions from anon, authenticated;
revoke all on public.chat_messages from anon, authenticated;
grant select, delete on public.chat_sessions to authenticated;
grant select, delete on public.chat_messages to authenticated;

-- Rate-limit counts in one round trip. A "visitor" is the IP hash OR the
-- session id, so rotating either one alone doesn't reset the count.
create function public.chat_rate_counts(p_ip_hash text, p_session_id uuid, p_short_minutes integer)
returns table (visitor_short bigint, visitor_day bigint, global_day bigint)
language sql stable
set search_path = public
as $$
  select
    count(*) filter (where m.created_at > now() - make_interval(mins => p_short_minutes)
                     and (s.ip_hash = p_ip_hash or s.id = p_session_id)),
    count(*) filter (where s.ip_hash = p_ip_hash or s.id = p_session_id),
    count(*)
  from chat_messages m
  join chat_sessions s on s.id = m.session_id
  where m.role = 'user' and m.created_at > now() - interval '24 hours';
$$;

-- Upsert the session and append one message atomically.
create function public.chat_record_message(
  p_session_id uuid,
  p_ip_hash text,
  p_first_page text,
  p_user_agent text,
  p_role text,
  p_content text,
  p_page_path text,
  p_model text default null,
  p_input_tokens integer default null,
  p_output_tokens integer default null,
  p_cache_read_tokens integer default null,
  p_cache_write_tokens integer default null,
  p_flagged boolean default false
)
returns void
language plpgsql
set search_path = public
as $$
begin
  insert into chat_sessions (id, ip_hash, first_page, user_agent_short)
  values (p_session_id, p_ip_hash, p_first_page, p_user_agent)
  on conflict (id) do nothing;

  insert into chat_messages (session_id, role, content, page_path, model,
    input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, flagged)
  values (p_session_id, p_role, p_content, p_page_path, p_model,
    p_input_tokens, p_output_tokens, p_cache_read_tokens, p_cache_write_tokens, p_flagged);

  update chat_sessions
  set message_count = message_count + 1, last_message_at = now()
  where id = p_session_id;
end;
$$;

-- 90-day retention. Called opportunistically (about 1 in 100 chat requests,
-- and on every /admin/chats load) -- no cron.
create function public.chat_purge_old(p_days integer)
returns void
language sql
set search_path = public
as $$
  delete from chat_messages where created_at < now() - make_interval(days => p_days);
  delete from chat_sessions where last_message_at < now() - make_interval(days => p_days);
$$;

-- New functions are EXECUTE-able by PUBLIC by default (see decrement_inventory
-- in PROJECT_BIBLE 5o). Only service_role may call these.
revoke all on function public.chat_rate_counts(text, uuid, integer) from public, anon, authenticated;
revoke all on function public.chat_record_message(uuid, text, text, text, text, text, text, text, integer, integer, integer, integer, boolean) from public, anon, authenticated;
revoke all on function public.chat_purge_old(integer) from public, anon, authenticated;
grant execute on function public.chat_rate_counts(text, uuid, integer) to service_role;
grant execute on function public.chat_record_message(uuid, text, text, text, text, text, text, text, integer, integer, integer, integer, boolean) to service_role;
grant execute on function public.chat_purge_old(integer) to service_role;

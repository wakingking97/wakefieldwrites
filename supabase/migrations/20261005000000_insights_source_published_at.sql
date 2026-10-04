alter table public.insights add column source_published_at timestamptz;

-- Backfill from Substack's archive API (post_date).
update public.insights set source_published_at = '2026-10-04T17:21:27.321Z'
  where substack_url = 'https://thehumanspeciesproject.substack.com/p/the-check-comes-after';
update public.insights set source_published_at = '2026-09-27T17:01:25.915Z'
  where substack_url = 'https://thehumanspeciesproject.substack.com/p/the-pen-was-never-alone';
update public.insights set source_published_at = '2026-09-13T17:01:45.147Z'
  where substack_url = 'https://thehumanspeciesproject.substack.com/p/the-theater-of-division';

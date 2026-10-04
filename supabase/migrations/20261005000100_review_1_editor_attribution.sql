-- Disclose that Margaret Manos edited the book. Name and review text unchanged.
update public.reviews
  set role = 'editor of Pulling the Thread (via Reedsy) · 25+ years, 90+ books'
  where id = 1 and name = 'Margaret Manos';

-- Two buckets: one public (thumbnails, hero/domain imagery, non-sensitive
-- project media), one private (resumes, protected reports). See
-- supabase/README.md for the folder layout convention inside each.

insert into storage.buckets (id, name, public)
values ('portfolio-public', 'portfolio-public', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('portfolio-private', 'portfolio-private', false)
on conflict (id) do nothing;

-- Public bucket: anyone can read. No anon/authenticated write policy —
-- uploads happen server-side in the admin app via the service role key,
-- which bypasses storage RLS.
drop policy if exists "public read portfolio-public" on storage.objects;
create policy "public read portfolio-public"
  on storage.objects for select
  using (bucket_id = 'portfolio-public');

-- Private bucket: intentionally no public policies at all. Reads happen
-- only via signed URLs the admin app (or a future protected route)
-- generates server-side with the service role key.

-- Seeds homepage_media from the MP4s already uploaded to the
-- portfolio-public bucket's VIDEOS/ folder. Paths below are the exact
-- object names (URL-decoded, including their original typos) from the
-- URLs shared for this project — do not "fix" the spelling here without
-- also renaming the actual Storage object, or the path will 404.
--
-- No poster_path is set for any row: no poster stills have been
-- uploaded to Storage yet. The frontend falls back to a local static
-- image per section when there's no poster, so this is not blocking.

insert into homepage_media (section_key, media_type, storage_path, motion_type, sort_order) values
  ('hero', 'video', 'VIDEOS/HERO.mp4', 'hero', 1),
  ('domains', 'video', 'VIDEOS/one ffoundation four domains.mp4', 'domains', 2),
  ('career-branches', 'video', 'VIDEOS/career branch.mp4', 'domains', 3),
  ('engineering', 'video', 'VIDEOS/seismic tower.mp4', 'domain-beat', 4),
  ('data', 'video', 'VIDEOS/data insight.mp4', 'domain-beat', 5),
  ('analytics', 'video', 'VIDEOS/analytics decsion.mp4', 'domain-beat', 6),
  ('leadership', 'video', 'VIDEOS/leadership.mp4', 'domain-beat', 7),
  ('methodology', 'video', 'VIDEOS/ideas model compact.mp4', 'methodology', 8),
  ('integrated', 'video', 'VIDEOS/intrgeated solutions.mp4', 'bridge', 9),
  ('closing', 'video', 'VIDEOS/closing.mp4', 'closing', 10)
on conflict (section_key) do update set
  media_type = excluded.media_type,
  storage_path = excluded.storage_path,
  motion_type = excluded.motion_type,
  sort_order = excluded.sort_order,
  updated_at = now();

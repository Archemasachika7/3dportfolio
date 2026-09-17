-- project_media was missing poster_path and caption from the fuller
-- media spec. Additive and safe: no project_media rows exist yet (no
-- projects have been published), so there's nothing to backfill.

alter table project_media add column if not exists poster_path text;
alter table project_media add column if not exists caption text;

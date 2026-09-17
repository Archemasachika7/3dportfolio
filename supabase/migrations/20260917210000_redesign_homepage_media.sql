-- The homepage_media shape from the first CMS pass (media_path/video_path/
-- mobile_media_path) has been superseded by the fuller spec: a single
-- storage_path that's either a video or an image depending on
-- media_type, a poster_path for video fallback frames, and
-- mobile_storage_path for a differently-cropped mobile asset. The table
-- is empty (nothing has been seeded into it yet), so this drops and
-- recreates it rather than trying to migrate rows that don't exist.

drop table if exists homepage_media cascade;

create table homepage_media (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  media_type text not null default 'image', -- 'image' | 'video'
  storage_path text,
  poster_path text,
  mobile_storage_path text,
  alt_text text,
  motion_type text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on homepage_media;
create trigger set_updated_at before update on homepage_media
  for each row execute function set_updated_at();

alter table homepage_media enable row level security;

drop policy if exists "public read enabled homepage_media" on homepage_media;
create policy "public read enabled homepage_media" on homepage_media
  for select using (enabled = true);

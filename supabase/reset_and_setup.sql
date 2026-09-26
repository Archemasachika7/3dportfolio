-- =====================================================================
-- Portfolio site + admin — full Supabase reset and setup
--
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- It builds the complete schema both apps use (3dportfolio and
-- web3-portfolio-builder) in one pass.
--
-- !! DESTRUCTIVE !!
-- Step 0 drops EVERY table in the `public` schema. All rows in them —
-- projects, reports, resumes, certificates, profile, everything — are
-- gone for good. Export anything you want to keep before running.
--
-- Not touched:
--   * auth.users — your admin login keeps working.
--   * Files in Storage — uploaded images, videos and PDFs stay in their
--     buckets. Only the database rows that pointed at them are removed,
--     so re-attach them from the admin afterwards.
--
-- Safe to run again: every run ends in the same clean, seeded state.
-- This file lives outside supabase/migrations on purpose, so
-- `supabase db push` never runs it by accident.
-- =====================================================================


-- =====================================================================
-- 0. Drop everything
-- =====================================================================

do $$
declare
  r record;
begin
  for r in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      -- Leave tables that belong to an extension (e.g. PostGIS) alone;
      -- Postgres refuses to drop those directly.
      and not exists (
        select 1 from pg_depend d
        where d.classid = 'pg_class'::regclass
          and d.objid = c.oid
          and d.deptype = 'e'
      )
  loop
    execute format('drop table if exists public.%I cascade', r.relname);
  end loop;
end
$$;

drop function if exists public.set_updated_at() cascade;
drop function if exists public.enforce_project_publish_requirements() cascade;


-- =====================================================================
-- 1. Extensions and helpers
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- Keeps updated_at fresh on every UPDATE.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =====================================================================
-- 2. Tables
-- =====================================================================

-- Shared tag vocabulary: projects, resumes, achievements, experience,
-- certificates and domain nodes all filter through it.
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text,                               -- 'domain' | 'skill' | 'tool' | ...
  description text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  file_path text not null,                 -- path in portfolio-public
  version integer not null default 1,
  priority integer not null default 0,
  is_current boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resume_tags (
  resume_id uuid not null references public.resumes(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (resume_id, tag_id)
);

-- Effectively one row: the identity block the site reads.
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_name text,
  headline text,
  short_bio text,
  long_bio text,
  profile_image_path text,
  current_cgpa text,
  current_status text,
  email text,
  phone text,
  show_phone boolean not null default false,
  location text,
  website_url text,
  github_url text,
  linkedin_url text,
  instagram_url text,
  other_links jsonb not null default '[]'::jsonb,  -- [{label, url}]
  availability_status text,
  current_role_title text,
  current_company text,
  primary_domain text,
  secondary_domains text[] not null default '{}'::text[],
  resume_id uuid references public.resumes(id) on delete set null,
  featured_profile boolean not null default true,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text,
  field text,
  program text,
  location text,
  start_year integer,
  end_year integer,
  is_current boolean not null default false,
  cgpa text,
  grade text,
  score text,
  rank text,
  description text,
  logo_path text,
  website_url text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  value text,
  organization text,
  category text,
  description text,
  year integer,
  link text,
  credential_url text,
  certificate_id text,
  image_path text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.achievement_tags (
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (achievement_id, tag_id)
);

create table public.experience (
  id uuid primary key default gen_random_uuid(),
  organization text not null,
  role text not null,
  employment_type text,                    -- 'full-time' | 'internship' | 'contract' | ...
  location text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  short_description text,
  long_description text,
  website_url text,
  logo_path text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.experience_tags (
  experience_id uuid not null references public.experience(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (experience_id, tag_id)
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  credential_name text,
  issue_date date,
  expiry_date date,
  credential_id text,
  credential_url text,
  certificate_file_path text,              -- PDF in portfolio-public
  thumbnail_path text,                     -- image in portfolio-public
  description text,
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.certificate_tags (
  certificate_id uuid not null references public.certificates(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (certificate_id, tag_id)
);

-- The one project table. Domain filtering happens through project_tags.
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_bio text,
  long_description text,
  year integer,
  role text,
  status text not null default 'draft',
  thumbnail_path text,
  hero_media_path text,                    -- image or video
  project_url text,
  github_url text,
  live_url text,
  documentation_url text,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_tags (
  project_id uuid not null references public.projects(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (project_id, tag_id)
);

-- Gallery media beyond the thumbnail/hero: screenshots, diagrams,
-- videos and CAD/3D models.
create table public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  media_type text not null,                -- 'screenshot' | 'diagram' | 'model' | 'video' | 'other'
  storage_path text not null,
  poster_path text,
  alt_text text,
  caption text,
  display_order integer not null default 0,
  featured boolean not null default false,
  motion_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PDFs attached to a project. A project needs at least one published
-- report before it can be published (see the publish gate below).
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  file_path text not null,
  file_type text not null default 'pdf',
  file_size integer,
  description text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Swappable visual per homepage section.
create table public.homepage_media (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,        -- 'hero' | 'domains' | 'methodology' | 'closing' | ...
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

-- Career-map nodes: primary domains and role lenses.
create table public.domain_nodes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  level text not null default 'primary',   -- 'primary' | 'lens'
  description text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.domain_node_tags (
  domain_node_id uuid not null references public.domain_nodes(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (domain_node_id, tag_id)
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,                  -- 'github' | 'linkedin' | 'email' | ...
  label text not null,
  url text not null,
  icon_key text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Single row of site-wide settings.
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_title text,
  site_description text,
  favicon_path text,
  default_og_image_path text,
  contact_email text,
  footer_text text,
  copyright_text text,
  availability_text text,
  primary_location text,
  maintenance_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admin-only history. Never read by the public site.
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,               -- 'project' | 'profile' | 'resume' | ...
  entity_id uuid,
  action text not null,                    -- 'created' | 'updated' | 'published' | 'unpublished' | 'deleted' | 'uploaded'
  actor text,
  detail text,
  created_at timestamptz not null default now()
);


-- =====================================================================
-- 3. Indexes
-- =====================================================================

create index idx_projects_published on public.projects(published);
create index idx_experience_published on public.experience(published);
create index idx_certificates_published on public.certificates(published);
create index idx_reports_project on public.reports(project_id);
create index idx_project_media_project on public.project_media(project_id);
create index idx_profiles_resume on public.profiles(resume_id);
create index idx_project_tags_tag on public.project_tags(tag_id);
create index idx_resume_tags_tag on public.resume_tags(tag_id);
create index idx_achievement_tags_tag on public.achievement_tags(tag_id);
create index idx_experience_tags_tag on public.experience_tags(tag_id);
create index idx_certificate_tags_tag on public.certificate_tags(tag_id);
create index idx_domain_node_tags_tag on public.domain_node_tags(tag_id);
create index idx_activity_log_created on public.activity_log(created_at desc);
create index idx_activity_log_entity on public.activity_log(entity_type, entity_id);


-- =====================================================================
-- 4. Triggers
-- =====================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'tags', 'resumes', 'profiles', 'education', 'achievements',
    'experience', 'certificates', 'projects', 'project_media', 'reports',
    'homepage_media', 'domain_nodes', 'social_links', 'site_settings'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end
$$;

-- A project can't be published without a title, short bio, thumbnail,
-- project URL, at least one tag and at least one published report. This
-- backs up the admin's own checks so no client can publish an
-- incomplete project.
--
-- Known limit: it runs when the project row changes. Deleting the last
-- tag or report of an already-published project doesn't unpublish it.
create function public.enforce_project_publish_requirements()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.published then
    if new.title is null or btrim(new.title) = '' then
      raise exception 'Cannot publish project %: title is required', new.id;
    end if;
    if new.short_bio is null or btrim(new.short_bio) = '' then
      raise exception 'Cannot publish project %: short_bio is required', new.id;
    end if;
    if new.thumbnail_path is null or btrim(new.thumbnail_path) = '' then
      raise exception 'Cannot publish project %: thumbnail_path is required', new.id;
    end if;
    if new.project_url is null or btrim(new.project_url) = '' then
      raise exception 'Cannot publish project %: project_url is required', new.id;
    end if;
    if not exists (select 1 from public.project_tags where project_id = new.id) then
      raise exception 'Cannot publish project %: at least one tag is required', new.id;
    end if;
    if not exists (
      select 1 from public.reports where project_id = new.id and published = true
    ) then
      raise exception 'Cannot publish project %: at least one published report (PDF) is required', new.id;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_enforce_project_publish
  before insert or update of published, title, short_bio, thumbnail_path, project_url
  on public.projects
  for each row
  execute function public.enforce_project_publish_requirements();


-- =====================================================================
-- 5. Access: Row Level Security
--
-- Visitors (anon key) can only READ published or enabled rows. There
-- are no write policies at all: every admin write runs server-side with
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS. activity_log has RLS on
-- and no policy, so only the service role can see it.
-- =====================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'tags', 'resumes', 'resume_tags', 'profiles', 'education',
    'achievements', 'achievement_tags', 'experience', 'experience_tags',
    'certificates', 'certificate_tags', 'projects', 'project_tags',
    'project_media', 'reports', 'homepage_media', 'domain_nodes',
    'domain_node_tags', 'social_links', 'site_settings', 'activity_log'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end
$$;

create policy "public read published profiles" on public.profiles
  for select to anon, authenticated using (published = true);

create policy "public read published education" on public.education
  for select to anon, authenticated using (published = true);

create policy "public read published achievements" on public.achievements
  for select to anon, authenticated using (published = true);

create policy "public read published experience" on public.experience
  for select to anon, authenticated using (published = true);

create policy "public read published certificates" on public.certificates
  for select to anon, authenticated using (published = true);

create policy "public read published projects" on public.projects
  for select to anon, authenticated using (published = true);

create policy "public read published resumes" on public.resumes
  for select to anon, authenticated using (published = true);

create policy "public read published domain_nodes" on public.domain_nodes
  for select to anon, authenticated using (published = true);

create policy "public read enabled homepage_media" on public.homepage_media
  for select to anon, authenticated using (enabled = true);

create policy "public read enabled social_links" on public.social_links
  for select to anon, authenticated using (enabled = true);

create policy "public read site_settings" on public.site_settings
  for select to anon, authenticated using (true);

-- Media and reports are visible only when their project is published.
create policy "public read project_media" on public.project_media
  for select to anon, authenticated using (
    exists (
      select 1 from public.projects p
      where p.id = project_media.project_id and p.published = true
    )
  );

create policy "public read published reports" on public.reports
  for select to anon, authenticated using (
    published = true
    and exists (
      select 1 from public.projects p
      where p.id = reports.project_id and p.published = true
    )
  );

-- Tags and join rows hold nothing sensitive; the published gate lives on
-- the parent row the site always joins through.
create policy "public read tags" on public.tags
  for select to anon, authenticated using (true);

create policy "public read resume_tags" on public.resume_tags
  for select to anon, authenticated using (true);

create policy "public read achievement_tags" on public.achievement_tags
  for select to anon, authenticated using (true);

create policy "public read experience_tags" on public.experience_tags
  for select to anon, authenticated using (true);

create policy "public read certificate_tags" on public.certificate_tags
  for select to anon, authenticated using (true);

create policy "public read project_tags" on public.project_tags
  for select to anon, authenticated using (true);

create policy "public read domain_node_tags" on public.domain_node_tags
  for select to anon, authenticated using (true);

-- Table privileges. RLS above still decides which rows anon can see;
-- these grants only make sure the API roles can reach the tables at all.
grant usage on schema public to anon, authenticated, service_role;
grant select on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;


-- =====================================================================
-- 6. Storage
--
-- portfolio-public holds everything the site shows (images, videos,
-- PDFs, CAD models). Files in a public bucket are served by URL with no
-- policy needed, and the admin uploads with the service role, so no
-- storage policies are created. The old "public read" policy is removed
-- on purpose: it let anyone list every file in the bucket.
--
-- portfolio-private is created for signed-URL use and is empty today.
-- =====================================================================

insert into storage.buckets (id, name, public)
values
  ('portfolio-public', 'portfolio-public', true),
  ('portfolio-private', 'portfolio-private', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read portfolio-public" on storage.objects;


-- =====================================================================
-- 7. Seed data
-- =====================================================================

-- Tag vocabulary.
insert into public.tags (name, slug, type) values
  ('Engineering', 'engineering', 'domain'),
  ('Civil', 'civil', 'skill'),
  ('Structural', 'structural', 'skill'),
  ('BIM', 'bim', 'skill'),
  ('Data', 'data', 'domain'),
  ('Data Science', 'data-science', 'skill'),
  ('Data Engineering', 'data-engineering', 'skill'),
  ('Machine Learning', 'machine-learning', 'skill'),
  ('Analytics', 'analytics', 'skill'),
  ('Business', 'business', 'domain'),
  ('Business Analytics', 'business-analytics', 'skill'),
  ('Decision Analytics', 'decision-analytics', 'skill'),
  ('Operations', 'operations', 'skill'),
  ('Strategy', 'strategy', 'skill'),
  ('Tech', 'tech', 'domain'),
  ('Software', 'software', 'skill'),
  ('Cloud', 'cloud', 'skill'),
  ('Python', 'python', 'tool'),
  ('SQL', 'sql', 'tool'),
  ('Core', 'core', 'domain'),
  ('Core Consultancy', 'core-consultancy', 'domain'),
  ('Consulting', 'consulting', 'skill'),
  ('Miscellaneous', 'miscellaneous', 'domain'),
  ('Leadership', 'leadership', 'skill'),
  ('Entrepreneurship', 'entrepreneurship', 'skill'),
  ('Marketing', 'marketing', 'skill'),
  ('Management', 'management', 'skill');

-- Career map: four primary domains and six role lenses.
insert into public.domain_nodes (slug, label, level, sort_order) values
  ('engineering', 'ENGINEERING', 'primary', 1),
  ('data-ai', 'DATA + AI', 'primary', 2),
  ('business-analytics', 'BUSINESS + ANALYTICS', 'primary', 3),
  ('leadership', 'LEADERSHIP + ENTREPRENEURSHIP', 'primary', 4),
  ('core', 'CORE', 'lens', 1),
  ('core-consultancy', 'CORE CONSULTANCY', 'lens', 2),
  ('tech', 'TECH', 'lens', 3),
  ('data-analytics-lens', 'DATA / ANALYTICS', 'lens', 4),
  ('business-lens', 'BUSINESS', 'lens', 5),
  ('miscellaneous', 'MISCELLANEOUS', 'lens', 6);

insert into public.domain_node_tags (domain_node_id, tag_id)
select dn.id, t.id
from (values
  ('engineering', 'engineering'), ('engineering', 'civil'), ('engineering', 'structural'), ('engineering', 'bim'),
  ('data-ai', 'data'), ('data-ai', 'data-science'), ('data-ai', 'data-engineering'), ('data-ai', 'machine-learning'), ('data-ai', 'analytics'),
  ('business-analytics', 'business'), ('business-analytics', 'business-analytics'), ('business-analytics', 'analytics'), ('business-analytics', 'decision-analytics'), ('business-analytics', 'operations'), ('business-analytics', 'strategy'),
  ('leadership', 'leadership'), ('leadership', 'entrepreneurship'), ('leadership', 'marketing'), ('leadership', 'management'),
  ('core', 'core'), ('core', 'engineering'), ('core', 'civil'), ('core', 'structural'), ('core', 'bim'),
  ('core-consultancy', 'core-consultancy'), ('core-consultancy', 'engineering'), ('core-consultancy', 'structural'), ('core-consultancy', 'bim'), ('core-consultancy', 'consulting'), ('core-consultancy', 'analytics'),
  ('tech', 'tech'), ('tech', 'software'), ('tech', 'cloud'), ('tech', 'data-engineering'), ('tech', 'python'), ('tech', 'sql'),
  ('data-analytics-lens', 'data'), ('data-analytics-lens', 'data-science'), ('data-analytics-lens', 'data-engineering'), ('data-analytics-lens', 'machine-learning'), ('data-analytics-lens', 'analytics'),
  ('business-lens', 'business'), ('business-lens', 'business-analytics'), ('business-lens', 'decision-analytics'), ('business-lens', 'strategy'), ('business-lens', 'operations'),
  ('miscellaneous', 'miscellaneous'), ('miscellaneous', 'leadership'), ('miscellaneous', 'entrepreneurship'), ('miscellaneous', 'marketing'), ('miscellaneous', 'management')
) as x(node_slug, tag_slug)
join public.domain_nodes dn on dn.slug = x.node_slug
join public.tags t on t.slug = x.tag_slug;

-- Homepage sections, pointing at the MP4s in portfolio-public/VIDEOS/.
-- The paths match the uploaded object names exactly, typos included. If
-- a file isn't in the bucket, the site falls back to its local image.
insert into public.homepage_media (section_key, media_type, storage_path, motion_type, sort_order) values
  ('hero', 'video', 'VIDEOS/HERO.mp4', 'hero', 1),
  ('domains', 'video', 'VIDEOS/one ffoundation four domains.mp4', 'domains', 2),
  ('career-branches', 'video', 'VIDEOS/career branch.mp4', 'domains', 3),
  ('engineering', 'video', 'VIDEOS/seismic tower.mp4', 'domain-beat', 4),
  ('data', 'video', 'VIDEOS/data insight.mp4', 'domain-beat', 5),
  ('analytics', 'video', 'VIDEOS/analytics decsion.mp4', 'domain-beat', 6),
  ('leadership', 'video', 'VIDEOS/leadership.mp4', 'domain-beat', 7),
  ('methodology', 'video', 'VIDEOS/ideas model compact.mp4', 'methodology', 8),
  ('integrated', 'video', 'VIDEOS/intrgeated solutions.mp4', 'bridge', 9),
  ('closing', 'video', 'VIDEOS/closing.mp4', 'closing', 10);

-- Education. CGPA is left empty on purpose; add it from the admin.
insert into public.education (institution, degree, field, start_year, sort_order, published) values
  ('Jadavpur University', 'B.E.', 'Civil Engineering', 2024, 1, true),
  ('IIT Madras', 'BS', 'Data Science', 2024, 2, true);

-- One empty settings row, so favicon/OG uploads work before the first save.
insert into public.site_settings default values;


-- =====================================================================
-- 8. Refresh the API schema cache so the new tables are live right away
-- =====================================================================

notify pgrst, 'reload schema';

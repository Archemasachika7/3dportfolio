-- Canonical schema for the portfolio CMS.
-- Both the public site and the admin app read/write these same tables —
-- do not fork this schema per repository.

-- ---------------------------------------------------------------------
-- profiles: single-row-ish bio/identity block. Public site reads this
-- instead of hard-coding name/headline/CGPA/etc.
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  headline text,
  short_bio text,
  long_bio text,
  profile_image_path text,
  current_cgpa text,
  current_status text,
  email text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- education
-- ---------------------------------------------------------------------
create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text,
  field text,
  start_year integer,
  end_year integer,
  cgpa text,
  description text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- achievements
-- ---------------------------------------------------------------------
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  value text,
  description text,
  year integer,
  link text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- tags: shared vocabulary used by projects, resumes, achievements and
-- domain nodes (the career-map filters). One table, many-to-many joins.
-- ---------------------------------------------------------------------
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists achievement_tags (
  achievement_id uuid not null references achievements(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (achievement_id, tag_id)
);

-- ---------------------------------------------------------------------
-- projects: the canonical project table. No per-domain project tables —
-- domain filtering happens entirely through project_tags.
-- ---------------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_bio text,
  long_description text,
  year integer,
  role text,
  status text not null default 'draft',
  thumbnail_path text,
  hero_media_path text,
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

create table if not exists project_tags (
  project_id uuid not null references projects(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (project_id, tag_id)
);

-- Supporting media beyond thumbnail/hero (screenshots, diagrams, models,
-- ambient video loops).
create table if not exists project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  media_type text not null, -- 'screenshot' | 'diagram' | 'model' | 'video' | 'other'
  storage_path text not null,
  alt_text text,
  display_order integer not null default 0,
  featured boolean not null default false,
  motion_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- reports: PDFs attached to a project. A project needs at least one
-- published report before it can itself be published (see the
-- publish-gate trigger migration).
-- ---------------------------------------------------------------------
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
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

-- ---------------------------------------------------------------------
-- resumes: tag-matched against domain nodes, same tag vocabulary as
-- projects.
-- ---------------------------------------------------------------------
create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  file_path text not null,
  version integer not null default 1,
  priority integer not null default 0,
  is_current boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists resume_tags (
  resume_id uuid not null references resumes(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (resume_id, tag_id)
);

-- ---------------------------------------------------------------------
-- homepage_media: lets the admin swap a homepage section's generated
-- visual without a frontend code change.
-- ---------------------------------------------------------------------
create table if not exists homepage_media (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique, -- e.g. 'hero', 'domains', 'methodology', 'closing'
  media_path text,
  mobile_media_path text,
  video_path text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- domain_nodes: the career-map nodes (primary domains + role lenses).
-- Stored as data, not hard-coded in frontend components, per node-tag
-- resolution requirements.
-- ---------------------------------------------------------------------
create table if not exists domain_nodes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  level text not null default 'primary', -- 'primary' | 'lens'
  description text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists domain_node_tags (
  domain_node_id uuid not null references domain_nodes(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (domain_node_id, tag_id)
);

-- ---------------------------------------------------------------------
-- Indexes for the query patterns the public site actually runs.
-- ---------------------------------------------------------------------
create index if not exists idx_projects_published on projects(published);
create index if not exists idx_project_tags_tag on project_tags(tag_id);
create index if not exists idx_resume_tags_tag on resume_tags(tag_id);
create index if not exists idx_reports_project on reports(project_id);
create index if not exists idx_project_media_project on project_media(project_id);
create index if not exists idx_domain_node_tags_tag on domain_node_tags(tag_id);
create index if not exists idx_domain_node_tags_node on domain_node_tags(domain_node_id);
create index if not exists idx_tags_slug on tags(slug);

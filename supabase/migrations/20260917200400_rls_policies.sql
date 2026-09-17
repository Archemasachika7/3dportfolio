-- Row Level Security: the public (anon) role can only SELECT published
-- content. No write policies are defined for anon or authenticated —
-- all writes go through the admin app's server-side code using
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS entirely and must never
-- be shipped to a browser bundle.

alter table profiles enable row level security;
alter table education enable row level security;
alter table tags enable row level security;
alter table achievements enable row level security;
alter table achievement_tags enable row level security;
alter table projects enable row level security;
alter table project_tags enable row level security;
alter table project_media enable row level security;
alter table reports enable row level security;
alter table resumes enable row level security;
alter table resume_tags enable row level security;
alter table homepage_media enable row level security;
alter table domain_nodes enable row level security;
alter table domain_node_tags enable row level security;

drop policy if exists "public read published profiles" on profiles;
create policy "public read published profiles" on profiles
  for select using (published = true);

drop policy if exists "public read published education" on education;
create policy "public read published education" on education
  for select using (published = true);

-- Tags and join tables carry no sensitive data on their own — the
-- "published" gate lives on the parent row (project/resume/achievement),
-- which the frontend always joins against.
drop policy if exists "public read tags" on tags;
create policy "public read tags" on tags
  for select using (true);

drop policy if exists "public read published achievements" on achievements;
create policy "public read published achievements" on achievements
  for select using (published = true);

drop policy if exists "public read achievement_tags" on achievement_tags;
create policy "public read achievement_tags" on achievement_tags
  for select using (true);

drop policy if exists "public read published projects" on projects;
create policy "public read published projects" on projects
  for select using (published = true);

drop policy if exists "public read project_tags" on project_tags;
create policy "public read project_tags" on project_tags
  for select using (true);

drop policy if exists "public read project_media" on project_media;
create policy "public read project_media" on project_media
  for select using (
    exists (
      select 1 from projects p
      where p.id = project_media.project_id and p.published = true
    )
  );

drop policy if exists "public read published reports" on reports;
create policy "public read published reports" on reports
  for select using (
    published = true
    and exists (
      select 1 from projects p
      where p.id = reports.project_id and p.published = true
    )
  );

drop policy if exists "public read published resumes" on resumes;
create policy "public read published resumes" on resumes
  for select using (published = true);

drop policy if exists "public read resume_tags" on resume_tags;
create policy "public read resume_tags" on resume_tags
  for select using (true);

drop policy if exists "public read enabled homepage_media" on homepage_media;
create policy "public read enabled homepage_media" on homepage_media
  for select using (enabled = true);

drop policy if exists "public read published domain_nodes" on domain_nodes;
create policy "public read published domain_nodes" on domain_nodes
  for select using (published = true);

drop policy if exists "public read domain_node_tags" on domain_node_tags;
create policy "public read domain_node_tags" on domain_node_tags
  for select using (true);

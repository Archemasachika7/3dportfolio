-- Keep updated_at fresh automatically on every UPDATE.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on profiles;
create trigger set_updated_at before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on education;
create trigger set_updated_at before update on education
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on achievements;
create trigger set_updated_at before update on achievements
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on tags;
create trigger set_updated_at before update on tags
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on projects;
create trigger set_updated_at before update on projects
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on project_media;
create trigger set_updated_at before update on project_media
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on reports;
create trigger set_updated_at before update on reports
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on resumes;
create trigger set_updated_at before update on resumes
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on homepage_media;
create trigger set_updated_at before update on homepage_media
  for each row execute function set_updated_at();

drop trigger if exists set_updated_at on domain_nodes;
create trigger set_updated_at before update on domain_nodes
  for each row execute function set_updated_at();

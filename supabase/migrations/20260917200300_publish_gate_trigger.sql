-- Non-negotiable rule (CMS spec #7 / #50.7): a project cannot be
-- published unless it has a title, short_bio, thumbnail_path,
-- project_url, at least one tag, and at least one published report.
--
-- This enforces that rule at the database level, as a backstop behind
-- whatever validation the admin UI does — so no client, however buggy,
-- can publish an incomplete project.
--
-- Known limitation: this fires on INSERT/UPDATE of the projects row
-- itself. Deleting the last tag or report from an already-published
-- project will NOT automatically unpublish it — the admin UI must also
-- guard against removing a project's last tag/report while published.
create or replace function enforce_project_publish_requirements()
returns trigger
language plpgsql
as $$
declare
  has_tag boolean;
  has_report boolean;
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

    select exists (
      select 1 from project_tags where project_id = new.id
    ) into has_tag;
    if not has_tag then
      raise exception 'Cannot publish project %: at least one tag is required', new.id;
    end if;

    select exists (
      select 1 from reports where project_id = new.id and published = true
    ) into has_report;
    if not has_report then
      raise exception 'Cannot publish project %: at least one published report (PDF) is required', new.id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_project_publish on projects;
create trigger trg_enforce_project_publish
  before insert or update of published, title, short_bio, thumbnail_path, project_url
  on projects
  for each row
  execute function enforce_project_publish_requirements();

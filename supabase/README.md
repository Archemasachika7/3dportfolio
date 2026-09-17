# Canonical portfolio schema

This directory is the source of truth for the Supabase schema shared by
the public portfolio (`3dportfolio`) and the admin app (not yet created —
see the main conversation for the `MOCHI` question still open). Both
repositories must read/write these same tables, field names, and Storage
paths — do not fork the schema per repo.

## Status: not yet applied

These migrations have **not** been run against any Supabase project.
The Supabase MCP connection available in the session that authored them
is tied to a different Supabase account (an org called "theia77's Org",
containing unrelated projects `beam-calculator`, `pricescout`,
`GATE-KEEPER`) — not the project behind the portfolio's
`NEXT_PUBLIC_SUPABASE_URL`. Until that's resolved (or you run these
yourself), nothing here has touched a live database.

## How to run these

In order, either:

- **Supabase SQL Editor**: paste each file's contents in filename order
  (`20260917200000_...` through `20260917200600_...`) and run them one
  at a time, or
- **Supabase CLI**, once `supabase link --project-ref <your-ref>` is
  pointed at the right project: `supabase db push`.

Running them twice is safe — every `create table`/`create policy`/insert
uses `if not exists` / `on conflict do nothing` / `drop ... if exists`
guards, so re-applying is a no-op rather than an error.

## What's in each file

| File | Contents |
| --- | --- |
| `20260917200000_extensions.sql` | `pgcrypto` for `gen_random_uuid()` |
| `20260917200100_core_tables.sql` | All tables: `profiles`, `education`, `achievements` (+`achievement_tags`), `tags`, `projects` (+`project_tags`, `project_media`), `reports`, `resumes` (+`resume_tags`), `homepage_media`, `domain_nodes` (+`domain_node_tags`), plus indexes |
| `20260917200200_updated_at_triggers.sql` | Auto-updates `updated_at` on every `UPDATE` |
| `20260917200300_publish_gate_trigger.sql` | Blocks `published = true` on a project unless it has title, short_bio, thumbnail_path, project_url, ≥1 tag, and ≥1 published report |
| `20260917200400_rls_policies.sql` | RLS enabled everywhere; anon/public can only `SELECT` rows where `published = true` (or the equivalent `enabled`/join-published check). No write policies for anon or authenticated — see below |
| `20260917200500_storage_buckets.sql` | Creates `portfolio-public` (public read) and `portfolio-private` (no public access) buckets |
| `20260917200600_seed_tags_and_nodes.sql` | Seeds the tag vocabulary and the primary-domain / role-lens `domain_nodes`, with `domain_node_tags` resolving each node to its tags |

## Writes go through the service role only

On purpose, there are **no** `insert`/`update`/`delete` RLS policies for
the `anon` or `authenticated` roles on any table. All admin writes must
happen server-side (Next.js Route Handlers / Server Actions in the admin
app) using `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS. That key must
never reach a browser bundle. If/when the admin app adds its own
Supabase-Auth login for a human admin user, add scoped `authenticated`
write policies then — don't widen anon access to make that easier.

## Storage layout convention

```text
portfolio-public/
  hero/
  domains/
  methodology/
  closing/
  certificates/
  projects/
    <project-slug>/
      thumbnail.webp
      hero.webp
      video.mp4
      screenshots/
      diagrams/
      models/

portfolio-private/
  resumes/
  protected-reports/
```

Store the *path* inside a bucket (e.g. `projects/25-storey-rcc/thumbnail.webp`)
in the relevant `*_path` column, not a permanently baked-in public URL —
the app resolves the URL (or a signed URL, for the private bucket) at
read time.

## Known limitation

The publish-gate trigger fires on insert/update of a project's own row.
It does **not** re-check when the *last* tag or report for an
already-published project is deleted elsewhere — that project would stay
`published = true` with a now-missing requirement. The admin UI should
also guard against removing a project's last tag or last published
report while it's live; this wasn't added as a second trigger to keep
first-pass SQL that nobody has been able to test against a real database
as simple and low-risk as possible.

## Shared types

`shared/database.types.ts` is a hand-written TypeScript mirror of this
schema for both repos to import. Regenerate it from the real database
once connected (`supabase gen types typescript --project-id <ref>`) and
treat that generated version as authoritative going forward.

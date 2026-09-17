# Canonical portfolio schema

This directory is the source of truth for the Supabase schema shared by
the public portfolio (`3dportfolio`) and the future admin app (repo not
yet created). Both must read/write these same tables, field names, and
Storage paths — do not fork the schema per repo.

## Status

The first 7 migrations (`20260917200000` through `20260917200600`) have
been applied to the live project — you ran them yourself via the SQL
Editor. `20260917210200_seed_education.sql` has also been run (with its
original 2022/2023 `start_year` values, before they were corrected to
2024). The rest have **not** been confirmed run yet:

- `20260917210000_redesign_homepage_media.sql` drops and recreates
  `homepage_media` with the fuller shape from the media-migration spec
  (`media_type`, `storage_path`, `poster_path`, `mobile_storage_path`,
  `alt_text`, `motion_type`, `sort_order`) — the original version only
  had `media_path`/`video_path`/`mobile_media_path`. Safe to drop: the
  table was empty.
- `20260917210100_seed_homepage_media.sql` inserts 10 rows pointing at
  the MP4s already uploaded to `portfolio-public/VIDEOS/`. **If the
  homepage shows static fallback images instead of playing video, this
  is almost certainly the migration that hasn't run yet** — run
  `select count(*) from homepage_media;` in the SQL Editor to check; 0
  rows means `MotionMedia` is correctly falling back to local images by
  design, not broken.
- `20260917210300_project_media_add_columns.sql` adds
  `poster_path`/`caption` to `project_media`.
- `20260917220000_fix_education_years.sql` — **run this one** even
  though `20260917210200` already ran: that seed file uses a
  `WHERE NOT EXISTS` guard, so re-running the corrected version of it is
  a no-op once the rows exist. This is a plain `UPDATE` that actually
  fixes the live rows to `start_year = 2024`.

I still can't run these myself — see "Why I can't run these" below.

## How to run these

In order, either:

- **Supabase SQL Editor**: paste each file's contents in filename order
  and run them one at a time, or
- **Supabase CLI**, once `supabase link --project-ref <your-ref>` is
  pointed at the right project: `supabase db push`.

Running them twice is safe — every `create table`/`create policy`/insert
uses `if not exists` / `on conflict do nothing` / `drop ... if exists`
guards, so re-applying is a no-op rather than an error. The one
exception is `20260917210000`, which unconditionally drops and
recreates `homepage_media` — safe as long as that table stays empty of
anything you'd mind losing (it currently only holds what
`20260917210100` seeds).

## What's in each file

| File | Contents |
| --- | --- |
| `20260917200000_extensions.sql` | `pgcrypto` for `gen_random_uuid()` |
| `20260917200100_core_tables.sql` | All tables: `profiles`, `education`, `achievements` (+`achievement_tags`), `tags`, `projects` (+`project_tags`, `project_media`), `reports`, `resumes` (+`resume_tags`), `homepage_media` (superseded — see below), `domain_nodes` (+`domain_node_tags`), plus indexes |
| `20260917200200_updated_at_triggers.sql` | Auto-updates `updated_at` on every `UPDATE` |
| `20260917200300_publish_gate_trigger.sql` | Blocks `published = true` on a project unless it has title, short_bio, thumbnail_path, project_url, ≥1 tag, and ≥1 published report |
| `20260917200400_rls_policies.sql` | RLS enabled everywhere; anon/public can only `SELECT` rows where `published = true` (or the equivalent `enabled`/join-published check). No write policies for anon or authenticated — see below |
| `20260917200500_storage_buckets.sql` | Creates `portfolio-public` (public read) and `portfolio-private` (no public access) buckets |
| `20260917200600_seed_tags_and_nodes.sql` | Seeds the tag vocabulary and the primary-domain / role-lens `domain_nodes`, with `domain_node_tags` resolving each node to its tags |
| `20260917210000_redesign_homepage_media.sql` | Drops and recreates `homepage_media` with the corrected column set |
| `20260917210100_seed_homepage_media.sql` | Seeds 10 `homepage_media` rows pointing at the real uploaded MP4s |
| `20260917210200_seed_education.sql` | Seeds Jadavpur University and IIT Madras education rows (already run, with now-outdated years) |
| `20260917210300_project_media_add_columns.sql` | Adds `poster_path`/`caption` to `project_media` |
| `20260917220000_fix_education_years.sql` | Corrects both education rows' `start_year` to 2024 via `UPDATE` (the seed file's guard makes re-running it a no-op) |

## Writes go through the service role only

On purpose, there are **no** `insert`/`update`/`delete` RLS policies for
the `anon` or `authenticated` roles on any table. All admin writes must
happen server-side (Next.js Route Handlers / Server Actions in the admin
app) using `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS. That key must
never reach a browser bundle. If/when the admin app adds its own
Supabase-Auth login for a human admin user, add scoped `authenticated`
write policies then — don't widen anon access to make that easier.

## Storage layout, and a deliberate deviation from the spec

```text
portfolio-public/
  VIDEOS/                 <- what's actually there today (10 MP4s)
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
  resumes/                <- see note below
  reports/                <- see note below

portfolio-private/         <- currently unused
```

The spec's suggested layout puts `resumes/` and `protected-reports/` in
the **private** bucket, signed-URL-gated. I didn't implement that: the
public repo only ever holds the `anon` key (per the spec's own env var
list — no service-role key belongs here), and generating a signed URL
requires the service-role key. Without a signed-URL-issuing endpoint
somewhere (the admin app, once it exists, could expose one), the public
site has no way to serve anything from the private bucket at all. Since
a resume you're handing to a recruiter and a project report aren't
actually secret, I'm treating both as public-bucket content for now —
`VIEW`/`DOWNLOAD` just resolve a public URL directly. If you want them
genuinely access-controlled later, that's a signed-URL proxy the admin
app should own, not something to fake from the public repo.

Store the *path* inside a bucket (e.g. `projects/25-storey-rcc/thumbnail.webp`)
in the relevant `*_path` column, not a permanently baked-in public URL —
the app resolves the URL at read time via `lib/queries.js#publicMediaUrl`.

## Known limitation

The publish-gate trigger fires on insert/update of a project's own row.
It does **not** re-check when the *last* tag or report for an
already-published project is deleted elsewhere — that project would stay
`published = true` with a now-missing requirement. The admin UI should
also guard against removing a project's last tag or last published
report while it's live.

## Why I can't run these myself

The Supabase MCP connection available in this session authenticates to
an unrelated account (org "theia77's Org" — projects `beam-calculator`,
`pricescout`, `GATE-KEEPER`), not the one behind
`NEXT_PUBLIC_SUPABASE_URL`. Direct HTTPS to `*.supabase.co` from this
sandbox is also blocked by network policy. Both were confirmed by
testing, not assumed.

## Shared types

`shared/database.types.ts` is a hand-written TypeScript mirror of this
schema for both repos to import. Regenerate it from the real database
once connected (`supabase gen types typescript --project-id <ref>`) and
treat that generated version as authoritative going forward.

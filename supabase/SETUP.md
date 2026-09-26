# Supabase setup from scratch

One Supabase project serves both apps:

- **3dportfolio**: the public site. It reads only published rows, using the anon key.
- **web3-portfolio-builder**: the admin. It writes everything, using the service-role key on the server.

## 1. Run the SQL

Open Supabase → **SQL Editor** → **New query**, paste all of
[`reset_and_setup.sql`](./reset_and_setup.sql) and click **Run**.

> **It drops every table in `public` first.** All projects, reports,
> resumes and other rows are deleted permanently. Export anything you
> need before running it.
>
> Your admin login (`auth.users`) and the files in Storage are kept.

The script creates everything both apps need:

- **Tables:** all 21, with indexes.
- **Triggers:** the `updated_at` triggers and the project publish gate.
- **Security:** read-only RLS for visitors.
- **Storage:** the `portfolio-public` and `portfolio-private` buckets.
- **Seed data:**
  - the tag vocabulary
  - the career-map nodes
  - the homepage video rows pointing at `VIDEOS/*.mp4`
  - two education rows
  - an empty settings row

To check it worked, run:

```sql
select count(*) from tags;            -- 27
select count(*) from homepage_media;  -- 10
```

## 2. Create the admin login

1. Go to **Authentication → Users → Add user → Create new user**.
2. Enter your email and a strong password, tick **Auto Confirm User**, and create the user.

Skip this if the user already exists. Resetting the tables doesn't remove it.

## 3. Turn off public sign-ups (required)

Go to **Authentication → Sign In / Providers** and switch off **Allow new
users to sign up**.

The admin lets in *any* signed-in Supabase user. The anon key is public
because it ships in the site's JavaScript. With sign-ups on, anyone could
create an account with that key and open `/admin`.

## 4. Storage

- The `portfolio-public` bucket must contain the homepage videos at the
  exact paths in the seed:
  - `VIDEOS/HERO.mp4`
  - `VIDEOS/career branch.mp4`
  - and the other eight
  
  Any file that's missing falls back to a local image.
- Everything uploaded from the admin goes into `portfolio-public` under:
  - `PROJECTS/`, `REPORTS/`, `RESUMES/`, `CERTIFICATES/`
  - `PROFILE/`, `EDUCATION/`, `EXPERIENCE/`, `ACHIEVEMENTS/`
  - `HOMEPAGE/`, `SITE/`
- No storage policies are needed:
  - Public-bucket files are served by URL.
  - The admin uploads with the service-role key, which bypasses storage rules.
- **Storage → Settings → Upload file size limit** caps every upload.
  - The admin allows videos up to 200 MB and CAD models up to 150 MB.
  - The Free plan's maximum is 50 MB, so larger files need a paid plan.

## 5. Environment variables

Get the values from Supabase → **Project Settings → API Keys**. The
project URL is under **Connect** or **Project Settings → Data API**.

### 3dportfolio (public site)

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |

### web3-portfolio-builder (admin)

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | same URL as the site |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret key: **server only** |
| `NEXT_PUBLIC_SITE_URL` | optional, public site URL for "Preview site" (defaults to `https://3dportfolio-gray.vercel.app`) |

Rules:

- **Never** put the service-role key in the site project.
- **Never** prefix it with `NEXT_PUBLIC_`.
- **Never** commit it. It bypasses every security rule in the database.

Setting the variables:

- **Locally:** copy `.env.example` to `.env.local` in each repo and fill it in.
- **On Vercel:**
  1. Open **Project → Settings → Environment Variables**.
  2. Add the variables for Production and Preview.
  3. Redeploy. Deployments that already exist don't pick up new values.
  
  The admin repo is connected to three Vercel projects
  (`web3-portfolio-builder`, `-2vy4`, `-mv6t`). Set the variables on the
  one you actually use.

## 6. After a reset

The seed restores the structure, but not the content you entered before. Use the admin to:

1. Fill in the **Profile**.
2. Recreate the projects:
   - add each project's tags
   - upload at least one report
   - add a thumbnail and a project URL

   The publish gate requires all of these before a project can go live.
3. Upload the resumes and certificates again.

Old uploads are still visible in **Storage** in the admin, so you can
check what's there before uploading again.

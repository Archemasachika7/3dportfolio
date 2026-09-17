/**
 * Hand-written to match supabase/migrations/*.sql. Both the public site
 * and the admin app should import from this file (or a copy of it) so
 * field names can't drift between repositories.
 *
 * Once the Supabase CLI is linked to the correct project, regenerate the
 * authoritative version with:
 *
 *   supabase gen types typescript --project-id <ref> > shared/database.types.ts
 *
 * and reconcile any differences — the generated file is the source of
 * truth going forward; this one is a starting point.
 */

export type UUID = string

export interface Profile {
  id: UUID
  name: string
  headline: string | null
  short_bio: string | null
  long_bio: string | null
  profile_image_path: string | null
  current_cgpa: string | null
  current_status: string | null
  email: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export interface Education {
  id: UUID
  institution: string
  degree: string | null
  field: string | null
  start_year: number | null
  end_year: number | null
  cgpa: string | null
  description: string | null
  sort_order: number
  published: boolean
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: UUID
  title: string
  value: string | null
  description: string | null
  year: number | null
  link: string | null
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Tag {
  id: UUID
  name: string
  slug: string
  type: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: UUID
  title: string
  slug: string
  short_bio: string | null
  long_description: string | null
  year: number | null
  role: string | null
  status: string
  thumbnail_path: string | null
  hero_media_path: string | null
  project_url: string | null
  github_url: string | null
  live_url: string | null
  documentation_url: string | null
  featured: boolean
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type ProjectMediaType = "screenshot" | "diagram" | "model" | "video" | "other"

export interface ProjectMedia {
  id: UUID
  project_id: UUID
  media_type: ProjectMediaType
  storage_path: string
  poster_path: string | null
  alt_text: string | null
  caption: string | null
  display_order: number
  featured: boolean
  motion_type: string | null
  created_at: string
  updated_at: string
}

export interface Report {
  id: UUID
  project_id: UUID
  title: string
  file_path: string
  file_type: string
  file_size: number | null
  description: string | null
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Resume {
  id: UUID
  title: string
  slug: string
  description: string | null
  file_path: string
  version: number
  priority: number
  is_current: boolean
  published: boolean
  created_at: string
  updated_at: string
}

export type HomepageMediaType = "image" | "video"

export interface HomepageMedia {
  id: UUID
  section_key: string
  media_type: HomepageMediaType
  storage_path: string | null
  poster_path: string | null
  mobile_storage_path: string | null
  alt_text: string | null
  motion_type: string | null
  enabled: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type DomainNodeLevel = "primary" | "lens"

export interface DomainNode {
  id: UUID
  slug: string
  label: string
  level: DomainNodeLevel
  description: string | null
  sort_order: number
  published: boolean
  created_at: string
  updated_at: string
}

// Join-table rows, exposed in case a caller needs the raw pair rather
// than a hydrated/joined shape.
export interface ProjectTag {
  project_id: UUID
  tag_id: UUID
}

export interface ResumeTag {
  resume_id: UUID
  tag_id: UUID
}

export interface AchievementTag {
  achievement_id: UUID
  tag_id: UUID
}

export interface DomainNodeTag {
  domain_node_id: UUID
  tag_id: UUID
}

// Convenience hydrated shapes the frontend will actually work with once
// queries join tags in.
export interface ProjectWithTags extends Project {
  tags: Tag[]
  reports: Report[]
  media: ProjectMedia[]
}

export interface ResumeWithTags extends Resume {
  tags: Tag[]
}

export interface DomainNodeWithTags extends DomainNode {
  tags: Tag[]
}

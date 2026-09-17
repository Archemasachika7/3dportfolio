import { supabase } from "./supabase"

/**
 * Every function here is read-only (anon key) and resolves to an empty
 * value — never throws, never falls back to hard-coded content — when
 * Supabase isn't configured or a query fails. The public site shows a
 * controlled empty/error state instead; it does not fabricate data.
 */

const PUBLIC_BUCKET = "portfolio-public"

export function publicMediaUrl(path) {
  if (!path || !supabase) return null
  const { data } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(path)
  return data?.publicUrl ?? null
}

export async function getProfile() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("published", true)
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error("getProfile", error.message)
    return null
  }
  return data
}

export async function getEducation() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from("education")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
  if (error) {
    console.error("getEducation", error.message)
    return []
  }
  return data ?? []
}

export async function getAchievements() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
  if (error) {
    console.error("getAchievements", error.message)
    return []
  }
  return data ?? []
}

function hydrateProject(row) {
  return {
    ...row,
    tags: (row.project_tags ?? []).map((pt) => pt.tags).filter(Boolean),
    media: (row.project_media ?? [])
      .sort((a, b) => a.display_order - b.display_order)
      .map((m) => ({ ...m, storage_url: publicMediaUrl(m.storage_path) })),
    reports: (row.reports ?? [])
      .filter((r) => r.published)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => ({ ...r, file_url: publicMediaUrl(r.file_path) })),
    thumbnail_url: publicMediaUrl(row.thumbnail_path),
    hero_media_url: publicMediaUrl(row.hero_media_path)
  }
}

const PROJECT_SELECT = `
  *,
  project_tags ( tags ( id, name, slug, type ) ),
  project_media ( * ),
  reports ( * )
`

/**
 * Every 3D model attached to a published project, for the CAD viewer's
 * "from my work" shortcuts. Returns [] rather than throwing when Supabase
 * isn't configured, like every other query here.
 */
export async function getPublishedModels() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from("project_media")
    .select("id, storage_path, caption, alt_text, projects!inner ( title, slug, published )")
    .eq("media_type", "model")
    .eq("projects.published", true)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("getPublishedModels", error.message)
    return []
  }

  return (data ?? [])
    .map((row) => ({
      id: row.id,
      title: row.caption || row.projects?.title || "Model",
      slug: row.projects?.slug ?? null,
      url: publicMediaUrl(row.storage_path),
      name: row.storage_path?.split("/").pop() ?? "model"
    }))
    .filter((m) => m.url)
}

export async function getPublishedProjects() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
  if (error) {
    console.error("getPublishedProjects", error.message)
    return []
  }
  return (data ?? []).map(hydrateProject)
}

export async function getFeaturedProjects() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("published", true)
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
  if (error) {
    console.error("getFeaturedProjects", error.message)
    return []
  }
  return (data ?? []).map(hydrateProject)
}

export async function getProjectBySlug(slug) {
  if (!supabase || !slug) return null
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle()
  if (error) {
    console.error("getProjectBySlug", error.message)
    return null
  }
  return data ? hydrateProject(data) : null
}

/** Published projects whose tags intersect the given tag slugs. */
export async function getProjectsByTagSlugs(tagSlugs) {
  if (!supabase || !tagSlugs?.length) return []
  const { data: matchingProjectIds, error: idError } = await supabase
    .from("project_tags")
    .select("project_id, tags!inner(slug)")
    .in("tags.slug", tagSlugs)
  if (idError) {
    console.error("getProjectsByTagSlugs (ids)", idError.message)
    return []
  }
  const ids = [...new Set((matchingProjectIds ?? []).map((r) => r.project_id))]
  if (!ids.length) return []

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("published", true)
    .in("id", ids)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
  if (error) {
    console.error("getProjectsByTagSlugs", error.message)
    return []
  }
  return (data ?? []).map(hydrateProject)
}

function hydrateResume(row) {
  return {
    ...row,
    tags: (row.resume_tags ?? []).map((rt) => rt.tags).filter(Boolean),
    file_url: publicMediaUrl(row.file_path)
  }
}

const RESUME_SELECT = `
  *,
  resume_tags ( tags ( id, name, slug, type ) )
`

export async function getResumes() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from("resumes")
    .select(RESUME_SELECT)
    .eq("published", true)
    .order("priority", { ascending: false })
  if (error) {
    console.error("getResumes", error.message)
    return []
  }
  return (data ?? []).map(hydrateResume)
}

export async function getCurrentResume() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from("resumes")
    .select(RESUME_SELECT)
    .eq("published", true)
    .eq("is_current", true)
    .order("priority", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error("getCurrentResume", error.message)
    return null
  }
  return data ? hydrateResume(data) : null
}

export async function getResumeBySlug(slug) {
  if (!supabase || !slug) return null
  const { data, error } = await supabase
    .from("resumes")
    .select(RESUME_SELECT)
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle()
  if (error) {
    console.error("getResumeBySlug", error.message)
    return null
  }
  return data ? hydrateResume(data) : null
}

/**
 * Best-matching published resume for a set of tag slugs: highest tag
 * overlap, ties broken by priority, then is_current.
 */
export async function getBestMatchingResume(tagSlugs) {
  const resumes = await getResumes()
  if (!resumes.length) return null
  if (!tagSlugs?.length) {
    return resumes.find((r) => r.is_current) ?? resumes[0]
  }

  const wanted = new Set(tagSlugs)
  let best = null
  let bestScore = -1
  for (const resume of resumes) {
    const overlap = resume.tags.filter((t) => wanted.has(t.slug)).length
    const score = overlap * 1000 + resume.priority + (resume.is_current ? 1 : 0)
    if (overlap > 0 && score > bestScore) {
      best = resume
      bestScore = score
    }
  }
  return best ?? resumes.find((r) => r.is_current) ?? resumes[0]
}

export async function getHomepageMedia() {
  if (!supabase) return {}
  const { data, error } = await supabase
    .from("homepage_media")
    .select("*")
    .eq("enabled", true)
    .order("sort_order", { ascending: true })
  if (error) {
    console.error("getHomepageMedia", error.message)
    return {}
  }
  const bySection = {}
  for (const row of data ?? []) {
    bySection[row.section_key] = {
      ...row,
      storage_url: publicMediaUrl(row.storage_path),
      poster_url: publicMediaUrl(row.poster_path),
      mobile_storage_url: publicMediaUrl(row.mobile_storage_path)
    }
  }
  return bySection
}

function hydrateDomainNode(row) {
  return {
    ...row,
    tags: (row.domain_node_tags ?? []).map((dnt) => dnt.tags).filter(Boolean)
  }
}

export async function getDomainNodes() {
  if (!supabase) return { primary: [], lens: [] }
  const { data, error } = await supabase
    .from("domain_nodes")
    .select("*, domain_node_tags ( tags ( id, name, slug, type ) )")
    .eq("published", true)
    .order("sort_order", { ascending: true })
  if (error) {
    console.error("getDomainNodes", error.message)
    return { primary: [], lens: [] }
  }
  const nodes = (data ?? []).map(hydrateDomainNode)
  return {
    primary: nodes.filter((n) => n.level === "primary"),
    lens: nodes.filter((n) => n.level === "lens")
  }
}

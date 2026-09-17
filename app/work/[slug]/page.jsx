import { notFound } from "next/navigation"
import { getProjectBySlug } from "../../../lib/queries"
import styles from "./project.module.css"

export const revalidate = 60

export async function generateMetadata({ params }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) return { title: "Project | Archishman Das" }
  return {
    title: `${project.title} | Archishman Das`,
    description: project.short_bio || undefined
  }
}

export default async function ProjectDetailPage({ params }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) notFound()

  const heroUrl = project.hero_media_url || project.thumbnail_url

  return (
    <article className={styles.article}>
      <div className={styles.header}>
        {project.tags?.length > 0 && (
          <div className={styles.tags}>
            {project.tags.map((tag) => (
              <span key={tag.id} className="label">{tag.name}</span>
            ))}
          </div>
        )}
        <h1 className={styles.title}>{project.title}</h1>
        {project.short_bio && <p className={styles.bio}>{project.short_bio}</p>}

        <div className={styles.meta}>
          {project.year && (
            <span className="label">YEAR — {project.year}</span>
          )}
          {project.role && <span className="label">ROLE — {project.role}</span>}
        </div>
      </div>

      {heroUrl && (
        <div className={styles.hero}>
          {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL */}
          <img src={heroUrl} alt="" className={styles.heroImg} />
        </div>
      )}

      {project.long_description && (
        <div className={styles.description}>
          {project.long_description.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {project.media?.length > 0 && (
        <div className={styles.mediaGrid}>
          {project.media.map((m) => (
            <div key={m.id} className={styles.mediaItem}>
              {m.storage_url && (
                // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL
                <img src={m.storage_url} alt={m.alt_text || ""} className={styles.mediaImg} />
              )}
              {m.caption && <span className={styles.mediaCaption}>{m.caption}</span>}
            </div>
          ))}
        </div>
      )}

      {project.reports?.length > 0 && (
        <div className={styles.reports}>
          <span className="label">REPORT</span>
          {project.reports.map((report) => (
            <div key={report.id} className={styles.reportRow}>
              <span>{report.title}</span>
              {report.file_url && (
                <div className={styles.reportActions}>
                  <a
                    href={report.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionLink}
                    data-cursor="interactive"
                  >
                    VIEW
                  </a>
                  <a
                    href={report.file_url}
                    download
                    className={styles.actionLink}
                    data-cursor="interactive"
                  >
                    DOWNLOAD
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.links}>
        {project.project_url && (
          <a
            href={project.project_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryLink}
            data-cursor="interactive"
          >
            VISIT PROJECT →
          </a>
        )}
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noopener noreferrer" className={styles.actionLink} data-cursor="interactive">
            GITHUB
          </a>
        )}
        {project.live_url && (
          <a href={project.live_url} target="_blank" rel="noopener noreferrer" className={styles.actionLink} data-cursor="interactive">
            LIVE DEMO
          </a>
        )}
        {project.documentation_url && (
          <a href={project.documentation_url} target="_blank" rel="noopener noreferrer" className={styles.actionLink} data-cursor="interactive">
            DOCUMENTATION
          </a>
        )}
      </div>

      <a href="/work" className={styles.back} data-cursor="interactive">
        ← ALL WORK
      </a>
    </article>
  )
}

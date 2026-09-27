import { notFound } from "next/navigation"
import { getProjectBySlug } from "../../../lib/queries"
import ModelBlock from "../../../components/cad/ModelBlock"
import PageIntro from "../../../components/motion/PageIntro"
import Reveal from "../../../components/motion/Reveal"
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

  // 3D models get an interactive viewer; everything else stays in the flat grid.
  const models = (project.media ?? []).filter((m) => m.media_type === "model" && m.storage_url)
  const flatMedia = (project.media ?? []).filter((m) => m.media_type !== "model")

  return (
    <article className={styles.article}>
      <PageIntro className={styles.header}>
        {project.tags?.length > 0 && (
          <div className={styles.tags} data-intro-item style={{ "--d": -5 }}>
            {project.tags.map((tag) => (
              <span key={tag.id} className="label">{tag.name}</span>
            ))}
          </div>
        )}
        <h1 className={styles.title} data-intro-heading><span>{project.title}</span></h1>
        {project.short_bio && <p className={styles.bio} data-intro-item style={{ "--d": 0 }}>{project.short_bio}</p>}

        <div className={styles.meta} data-intro-item style={{ "--d": 1 }}>
          {project.year && (
            <span className="label">YEAR — {project.year}</span>
          )}
          {project.role && <span className="label">ROLE — {project.role}</span>}
        </div>
      </PageIntro>

      <Reveal style={{ display: "contents" }}>

        {heroUrl && (
          <div className={styles.hero} data-reveal="wipe">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL */}
            <img src={heroUrl} alt="" className={styles.heroImg} />
          </div>
        )}

        {project.long_description && (
          <div className={styles.description} data-reveal>
            {project.long_description.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}

        {models.length > 0 && (
          <div className={styles.models} data-reveal>
            <span className="label">3D MODELS</span>
            {models.map((m) => (
              <ModelBlock
                key={m.id}
                url={m.storage_url}
                caption={m.caption}
                alt={m.alt_text}
              />
            ))}
          </div>
        )}

        {flatMedia.length > 0 && (
          <div className={styles.mediaGrid}>
            {flatMedia.map((m) => (
              <div key={m.id} className={styles.mediaItem} data-reveal>
                {m.storage_url && (
                  m.media_type === "video" ? (
                    <video
                      src={m.storage_url}
                      className={styles.mediaImg}
                      controls
                      playsInline
                      preload="none"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL
                    <img src={m.storage_url} alt={m.alt_text || ""} className={styles.mediaImg} />
                  )
                )}
                {m.caption && <span className={styles.mediaCaption}>{m.caption}</span>}
              </div>
            ))}
          </div>
        )}

        {project.reports?.length > 0 && (
          <div className={styles.reports} data-reveal>
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

        <div className={styles.links} data-reveal>
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

        <a href="/work" className={styles.back} data-cursor="interactive" data-reveal>
          ← ALL WORK
        </a>
      </Reveal>
    </article>
  )
}

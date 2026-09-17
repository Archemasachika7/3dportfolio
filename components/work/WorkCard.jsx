import styles from "./WorkCard.module.css"

export default function WorkCard({ project }) {
  const primaryReport = project.reports?.[0]

  return (
    <article className={styles.card} data-cursor="project" data-cursor-label="OPEN">
      <a href={`/work/${project.slug}`} className={styles.thumbLink} data-cursor="project">
        <div className={styles.thumb}>
          {project.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL
            <img src={project.thumbnail_url} alt="" className={styles.thumbImg} />
          ) : (
            <div className="bg-grid" style={{ position: "absolute", inset: 0 }} />
          )}
        </div>
      </a>

      <div className={styles.body}>
        <h3 className={styles.title}>
          <a href={`/work/${project.slug}`} className={styles.titleLink} data-cursor="interactive">
            {project.title}
          </a>
        </h3>

        {project.short_bio && <p className={styles.bio}>{project.short_bio}</p>}

        <div className={styles.actions}>
          {primaryReport?.file_url && (
            <a
              href={primaryReport.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionLink}
              data-cursor="interactive"
            >
              VIEW PDF
            </a>
          )}
          {project.project_url && (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionLink}
              data-cursor="interactive"
            >
              VISIT PROJECT →
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

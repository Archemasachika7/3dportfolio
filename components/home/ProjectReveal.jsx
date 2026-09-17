"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import styles from "./ProjectReveal.module.css"

const easeOut = [0.16, 1, 0.3, 1]

export default function ProjectReveal({ project, index }) {
  // Visibility is tracked on the unclipped article itself — tracking it on
  // the title/viewport directly would be circular, since their own
  // clip-path reveal shrinks their visible area to ~0, which would make
  // them permanently "invisible" to the observer that is supposed to
  // reveal them.
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })

  const primaryReport = project.reports?.[0]
  const domainTag = project.tags?.[0]

  return (
    <article
      ref={ref}
      className={styles.project}
      data-cursor="project"
      data-cursor-label="OPEN"
    >
      <div className={styles.meta}>
        <span className="label">
          {String(index + 1).padStart(2, "0")}
          {domainTag ? ` — ${domainTag.name.toUpperCase()}` : ""}
        </span>
        {project.year && <span className="label">{project.year}</span>}
      </div>

      <motion.h3
        className={styles.title}
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={inView ? { clipPath: "inset(0 0 0% 0)" } : undefined}
        transition={{ duration: 0.8, ease: easeOut }}
      >
        <a href={`/work/${project.slug}`} className={styles.titleLink} data-cursor="project">
          {project.title}
        </a>
      </motion.h3>

      {project.short_bio && <p className={styles.summary}>{project.short_bio}</p>}

      {project.tags?.length > 0 && (
        <ul className={styles.tags}>
          {project.tags.map((tag) => (
            <li key={tag.id} className={`label ${styles.tag}`}>
              {tag.name}
            </li>
          ))}
        </ul>
      )}

      <motion.div
        className={styles.viewport}
        initial={{ clipPath: "inset(0 48% 0 48%)" }}
        animate={inView ? { clipPath: "inset(0 0% 0 0%)" } : undefined}
        transition={{ duration: 1, delay: 0.15, ease: easeOut }}
      >
        <span className={styles.corner} data-pos="tl" aria-hidden="true" />
        <span className={styles.corner} data-pos="tr" aria-hidden="true" />
        <span className={styles.corner} data-pos="bl" aria-hidden="true" />
        <span className={styles.corner} data-pos="br" aria-hidden="true" />

        {project.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL
          <img src={project.thumbnail_url} alt="" className={styles.viewportImg} />
        ) : (
          <div className={`bg-grid ${styles.viewportGrid}`} />
        )}
      </motion.div>

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
    </article>
  )
}

"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import TechnicalDiagram from "../TechnicalDiagram"
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

  return (
    <article
      ref={ref}
      className={styles.project}
      data-cursor="project"
      data-cursor-label="OPEN"
    >
      <div className={styles.meta}>
        <span className="label">
          {String(index + 1).padStart(2, "0")} — {project.domain.toUpperCase()}
        </span>
        <span className="label">{project.year}</span>
      </div>

      <motion.h3
        className={styles.title}
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={inView ? { clipPath: "inset(0 0 0% 0)" } : undefined}
        transition={{ duration: 0.8, ease: easeOut }}
      >
        {project.title}
      </motion.h3>

      <p className={styles.summary}>{project.summary}</p>

      <ul className={styles.tags}>
        {project.tags.map((tag) => (
          <li key={tag} className={`label ${styles.tag}`}>
            {tag}
          </li>
        ))}
      </ul>

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

        {project.cover ? (
          <>
            <Image
              src={project.cover}
              alt=""
              fill
              loading="lazy"
              sizes="(max-width: 640px) 100vw, 1084px"
              className={styles.viewportImg}
            />
            <span className={styles.viewportCaption}>CONCEPT VISUAL — NOT ACTUAL ANALYSIS OUTPUT</span>
          </>
        ) : (
          <>
            <div className={`bg-grid ${styles.viewportGrid}`} />
            <div className={styles.viewportContent}>
              <TechnicalDiagram steps={project.diagram} />
            </div>
          </>
        )}
      </motion.div>

      {project.cover && (
        <div className={styles.processStrip}>
          <span className="label">PROCESS</span>
          <TechnicalDiagram steps={project.diagram} />
        </div>
      )}
    </article>
  )
}

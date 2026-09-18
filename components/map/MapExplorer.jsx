"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import WorkCard from "../work/WorkCard"
import { getProjectsByTagSlugs, getBestMatchingResume } from "../../lib/queries"
import styles from "./MapExplorer.module.css"

export default function MapExplorer({ primary, lens }) {
  const [selected, setSelected] = useState(null)
  const [projects, setProjects] = useState([])
  const [resume, setResume] = useState(null)
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const resultsRef = useRef(null)
  const deepLinked = useRef(false)

  const selectNode = useCallback((node) => {
    setSelected(node)
    startTransition(async () => {
      const tagSlugs = node.tags.map((t) => t.slug)
      const [proj, res] = await Promise.all([
        getProjectsByTagSlugs(tagSlugs),
        getBestMatchingResume(tagSlugs)
      ])
      setProjects(proj)
      setResume(res)
    })
  }, [])

  // Deep link from elsewhere on the site (e.g. a homepage domain card):
  // /map?node=<slug> opens straight into that domain's resume and work.
  useEffect(() => {
    if (deepLinked.current) return
    const slug = searchParams.get("node")
    if (!slug) return
    const match = [...primary, ...lens].find((n) => n.slug === slug)
    if (!match) return
    deepLinked.current = true
    selectNode(match)
    // Let the results render before scrolling to them.
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }, [searchParams, primary, lens, selectNode])

  return (
    <div>
      <div className={styles.tier}>
        <span className="label">PRIMARY DOMAINS</span>
        <div className={styles.nodeRow}>
          {primary.map((node) => (
            <button
              key={node.id}
              type="button"
              className={styles.node}
              data-active={selected?.id === node.id ? "true" : "false"}
              onClick={() => selectNode(node)}
              data-cursor="interactive"
            >
              {node.label}
            </button>
          ))}
        </div>
      </div>

      {lens.length > 0 && (
        <div className={styles.tier}>
          <span className="label">ROLE LENSES</span>
          <div className={styles.nodeRow}>
            {lens.map((node) => (
              <button
                key={node.id}
                type="button"
                className={styles.node}
                data-variant="lens"
                data-active={selected?.id === node.id ? "true" : "false"}
                onClick={() => selectNode(node)}
                data-cursor="interactive"
              >
                {node.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className={styles.results} aria-live="polite" ref={resultsRef}>
          <h2 className={styles.resultsHeading}>{selected.label}</h2>

          {isPending ? (
            <p className={styles.status}>Loading…</p>
          ) : (
            <>
              {resume && (
                <div className={styles.resumeCard}>
                  <span className="label">RESUME FOR THIS PATH</span>
                  <span className={styles.resumeTitle}>{resume.title}</span>
                  <div className={styles.resumeActions}>
                    {resume.file_url && (
                      <>
                        <a
                          href={resume.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.actionLink}
                          data-cursor="interactive"
                        >
                          VIEW RESUME
                        </a>
                        <a
                          href={resume.file_url}
                          download
                          className={styles.actionLink}
                          data-cursor="interactive"
                        >
                          DOWNLOAD
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}

              {projects.length === 0 ? (
                <p className={styles.status}>No published projects yet for this path.</p>
              ) : (
                <div className={styles.grid}>
                  {projects.map((project) => (
                    <WorkCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

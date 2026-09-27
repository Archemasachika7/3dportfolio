"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, LazyMotion, MotionConfig, m } from "motion/react"
import WorkCard from "../work/WorkCard"
import { getProjectsByTagSlugs, getBestMatchingResume } from "../../lib/queries"
import styles from "./MapExplorer.module.css"

// Motion's animation features load after first render — nothing here needs
// them until a chip is pressed — so they stay out of the bundle the page
// needs to appear.
const loadFeatures = () => import("./motionFeatures").then((mod) => mod.default)

// Motion values mirror the interface tokens in app/globals.css.
const OUT_QUART = [0.165, 0.84, 0.44, 1]

// The selection block slides from the old chip to the new one. Clicking
// through chips quickly re-targets it mid-flight, so it's a spring (which
// keeps its velocity) rather than a fixed curve — with no bounce, because
// a tap shouldn't wobble.
const SELECT = { type: "spring", visualDuration: 0.34, bounce: 0 }

// Results swap: the old set leaves quickly, the new one settles in and its
// cards follow each other by a beat.
const panel = {
  hidden: { opacity: 0, y: 12 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: OUT_QUART, staggerChildren: 0.05, delayChildren: 0.04 }
  },
  gone: { opacity: 0, y: -6, transition: { duration: 0.12, ease: OUT_QUART } }
}

const item = {
  hidden: { opacity: 0, y: 12 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.24, ease: OUT_QUART } }
}

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

  const chip = (node, variant) => {
    const active = selected?.id === node.id
    return (
      <button
        key={node.id}
        type="button"
        className={styles.node}
        data-variant={variant}
        data-active={active ? "true" : "false"}
        aria-pressed={active}
        onClick={() => selectNode(node)}
        data-cursor="interactive"
      >
        {active && <m.span layoutId="map-selection" className={styles.fill} transition={SELECT} />}
        <span className={styles.nodeText}>{node.label}</span>
      </button>
    )
  }

  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <div className={styles.tier} style={{ "--d": 0 }}>
          <span className="label">PRIMARY DOMAINS</span>
          <div className={styles.nodeRow}>{primary.map((node) => chip(node))}</div>
        </div>

        {lens.length > 0 && (
          <div className={styles.tier} style={{ "--d": 1 }}>
            <span className="label">ROLE LENSES</span>
            <div className={styles.nodeRow}>{lens.map((node) => chip(node, "lens"))}</div>
          </div>
        )}

        {selected && (
          <div className={styles.results} aria-live="polite" ref={resultsRef}>
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={`${selected.id}:${isPending ? "loading" : "ready"}`}
                variants={panel}
                initial="hidden"
                animate="shown"
                exit="gone"
              >
                <m.h2 className={styles.resultsHeading} variants={item}>
                  {selected.label}
                </m.h2>

                {isPending ? (
                  <m.div className={styles.status} variants={item} role="status">
                    <span>Loading</span>
                    <span className={styles.loadingBar} aria-hidden="true" />
                  </m.div>
                ) : (
                  <>
                    {resume && (
                      <m.div className={styles.resumeCard} variants={item}>
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
                      </m.div>
                    )}

                    {projects.length === 0 ? (
                      <m.p className={styles.status} variants={item}>
                        No published projects yet for this path.
                      </m.p>
                    ) : (
                      <div className={styles.grid}>
                        {projects.map((project) => (
                          <m.div key={project.id} className={styles.cell} variants={item}>
                            <WorkCard project={project} />
                          </m.div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </m.div>
            </AnimatePresence>
          </div>
        )}
      </MotionConfig>
    </LazyMotion>
  )
}

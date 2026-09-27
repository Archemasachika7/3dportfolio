"use client"

import { useRef } from "react"
import LineSegment from "../LineSegment"
import TimelineNode from "../TimelineNode"
import SectionHeader from "../motion/SectionHeader"
import useMotion, { setScope } from "../../hooks/useMotion"
import { gsap, splitLines, EASE } from "../../lib/motion"
import styles from "./EducationSection.module.css"

function yearRange(item) {
  if (!item.start_year) return null
  return item.end_year ? `${item.start_year} — ${item.end_year}` : `${item.start_year} — PRESENT`
}

// "8.62", "9.1/10", "92%" -> number + whatever follows it. Anything that
// doesn't start with a number is shown as-is, never counted.
function parseMetric(raw) {
  const m = String(raw).trim().match(/^(\d+(?:\.(\d+))?)(.*)$/)
  if (!m) return null
  return { value: parseFloat(m[1]), decimals: m[2]?.length ?? 0, suffix: m[3] }
}

/**
 * Each entry resolves as the rail reaches it: a connector ticks out from the
 * rail to the node, the institution rises through its line mask, the
 * discipline follows, and the CGPA counts up to its recorded value.
 */
export default function EducationSection({ education = [] }) {
  const ref = useRef(null)

  useMotion(
    ref,
    ({ reduce, mobile }) => {
      const root = ref.current
      if (reduce) return setScope(root, "static")

      const items = gsap.utils.toArray("[data-edu]", root)

      items.forEach((item) => {
        const q = gsap.utils.selector(item)
        const lines = splitLines(q("[data-institution]"), { duration: 0.9 })

        gsap.set(q("[data-connector]"), { scaleX: 0 })
        gsap.set(q("[data-institution]"), { autoAlpha: 1 })
        gsap.set(q("[data-discipline]"), { autoAlpha: 0, y: 8 })
        gsap.set(q("[data-metric]"), { autoAlpha: 0 })
        gsap.set(q("[data-logo]"), { autoAlpha: 0, scale: 0.92 })

        const tl = gsap.timeline({
          scrollTrigger: { trigger: item, start: mobile ? "top 88%" : "top 80%", once: true }
        })
        tl.to(q("[data-connector]"), { scaleX: 1, duration: 0.5, ease: EASE.cinematic })
          .call(lines.play, null, 0.15)
          .to(q("[data-logo]"), { autoAlpha: 1, scale: 1, duration: 0.5, ease: EASE.cinematic }, 0.1)
          .to(q("[data-discipline]"), { autoAlpha: 1, y: 0, duration: 0.6 }, 0.35)
          .to(q("[data-metric]"), { autoAlpha: 1, duration: 0.4 }, 0.5)

        q("[data-count]").forEach((el) => {
          const metric = parseMetric(el.dataset.count)
          if (!metric) return
          const counter = { v: 0 }
          const write = () =>
            (el.textContent = counter.v.toFixed(metric.decimals) + metric.suffix)
          write()
          tl.to(counter, { v: metric.value, duration: 1.1, ease: "power3.out", onUpdate: write }, 0.55)
        })
      })

      setScope(root, "live")
    },
    [education.length]
  )

  return (
    <section ref={ref} className={styles.section} aria-label="Education" data-motion-scope="pending">
      <SectionHeader index="01" label="EDUCATION" lines={["THE FOUNDATION"]} />

      {education.length === 0 ? (
        <p className={styles.empty}>Education timeline — awaiting content.</p>
      ) : (
        <div className={styles.timeline}>
          <div className={styles.rail}>
            <LineSegment start="top 90%" end="bottom 25%" />
          </div>

          <div className={styles.nodes}>
            {education.map((item) => (
              <div key={item.id} className={styles.item} data-edu>
                <span className={styles.connector} data-connector data-reveal aria-hidden="true" />
                <TimelineNode label={yearRange(item) ?? ""}>
                  <div className={styles.head}>
                    {item.logo_url && (
                      <span className={styles.logo} data-logo data-reveal>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.logo_url} alt="" loading="lazy" />
                      </span>
                    )}
                    <div className={styles.headText}>
                      <p className={styles.institution} data-institution data-reveal>
                        {item.website_url ? (
                          <a href={item.website_url} target="_blank" rel="noreferrer" className={styles.institutionLink}>
                            {item.institution}
                          </a>
                        ) : (
                          item.institution
                        )}
                      </p>
                      <p className={styles.discipline} data-discipline data-reveal>
                        {[item.degree, item.field].filter(Boolean).join(" — ")}
                      </p>
                    </div>
                  </div>

                  {item.cgpa && (
                    <div className={styles.metrics}>
                      <div className={styles.metric} data-metric data-reveal>
                        <span className="label">CGPA</span>
                        <span className={styles.metricValue} data-count={item.cgpa}>
                          {item.cgpa}
                        </span>
                      </div>
                    </div>
                  )}
                </TimelineNode>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

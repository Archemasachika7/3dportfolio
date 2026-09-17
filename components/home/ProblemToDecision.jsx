"use client"

import { useEffect, useRef, useState } from "react"
import MotionMedia from "../MotionMedia"
import MotionHeading from "../MotionHeading"
import useReducedMotion from "../../hooks/useReducedMotion"
import { thinkingSteps } from "../../data/career"
import styles from "./ProblemToDecision.module.css"

export default function ProblemToDecision({ media }) {
  const ref = useRef(null)
  const [active, setActive] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className={styles.section} aria-label="How I think">
      <MotionMedia
        media={media?.methodology}
        fallbackSrc="/images/methodology/ideas-models-impact.png"
        className={styles.backdrop}
      />

      <div className={styles.intro}>
        <span className="label">03 / HOW I THINK</span>
        <MotionHeading as="h2" className={styles.heading} lines={["ONE WORKING PATTERN"]} />
      </div>

      <div ref={ref} className={styles.chain}>
        <span className={styles.chainLine} aria-hidden="true" />
        {thinkingSteps.map((word, i) => (
          <div
            key={word}
            className={styles.step}
            data-active={active ? "true" : "false"}
            style={{ "--step-delay": active && !reduced ? `${i * 140}ms` : "0ms" }}
          >
            <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.word}>{word}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

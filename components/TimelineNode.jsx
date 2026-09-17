"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./TimelineNode.module.css"

/**
 * A node on the career line with a four-stage lifecycle:
 * dormant -> approaching -> active -> completed.
 * State is derived from how much of the node is in view, tracked with
 * an IntersectionObserver so it stays correct through fast scrolling.
 */
export default function TimelineNode({ label, meta, children, align = "left" }) {
  const ref = useRef(null)
  const [state, setState] = useState("dormant")
  const wasActive = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio

        if (entry.isIntersecting && ratio > 0.5) {
          wasActive.current = true
          setState("active")
        } else if (entry.isIntersecting && ratio > 0.1) {
          setState((prev) => (prev === "active" ? "active" : "approaching"))
        } else {
          setState(wasActive.current ? "completed" : "dormant")
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={styles.node}
      data-state={state}
      data-align={align}
      data-cursor="node"
      data-cursor-label={label}
    >
      <span className={styles.marker} />
      <div className={styles.body}>
        <span className={`label ${styles.label}`}>{label}</span>
        {meta && <span className={styles.meta}>{meta}</span>}
        {children}
      </div>
    </div>
  )
}

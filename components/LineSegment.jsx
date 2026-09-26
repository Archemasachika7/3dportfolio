"use client"

import { useRef } from "react"
import useMotion, { setScope } from "../hooks/useMotion"
import { gsap } from "../lib/motion"
import styles from "./LineSegment.module.css"

/**
 * A single stretch of the career line. It "draws" itself in — scaling
 * from 0 to 1 along its own axis — as it scrolls through the viewport.
 * Multiple segments placed end to end across sections read as one
 * continuous line without needing a single global path.
 */
export default function LineSegment({
  orientation = "vertical",
  className = "",
  start = "top 85%",
  end = "bottom 45%",
  scrub = 0.6
}) {
  const wrapRef = useRef(null)
  const lineRef = useRef(null)

  useMotion(
    wrapRef,
    ({ reduce }) => {
      if (reduce) return setScope(wrapRef.current, "static")
      const prop = orientation === "vertical" ? "scaleY" : "scaleX"
      gsap.set(lineRef.current, { [prop]: 0, autoAlpha: 1 })
      setScope(wrapRef.current, "live")
      gsap.to(lineRef.current, {
        [prop]: 1,
        ease: "none",
        scrollTrigger: { trigger: wrapRef.current, start, end, scrub }
      })
    },
    [orientation, start, end, scrub]
  )

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${
        orientation === "vertical" ? styles.vertical : styles.horizontal
      } ${className}`}
      data-motion-scope="pending"
    >
      <div ref={lineRef} className={styles.line} data-reveal />
    </div>
  )
}

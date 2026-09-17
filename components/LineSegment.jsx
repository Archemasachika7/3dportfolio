"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import useReducedMotion from "../hooks/useReducedMotion"
import styles from "./LineSegment.module.css"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

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
  const reduced = useReducedMotion()

  useEffect(() => {
    const wrap = wrapRef.current
    const line = lineRef.current
    if (!wrap || !line) return

    const prop = orientation === "vertical" ? "scaleY" : "scaleX"

    if (reduced) {
      gsap.set(line, { [prop]: 1 })
      return
    }

    gsap.set(line, { [prop]: 0 })

    const tween = gsap.to(line, {
      [prop]: 1,
      ease: "none",
      scrollTrigger: {
        trigger: wrap,
        start,
        end,
        scrub
      }
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [orientation, start, end, scrub, reduced])

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${
        orientation === "vertical" ? styles.vertical : styles.horizontal
      } ${className}`}
    >
      <div ref={lineRef} className={styles.line} />
    </div>
  )
}

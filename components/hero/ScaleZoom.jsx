"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { createScaleZoom } from "./zoom/engine"
import structure from "./zoom/structure"
import data from "./zoom/data"
import computation from "./zoom/computation"
import styles from "./ScaleZoom.module.css"

// Chapter order follows the headline: engineer × data × computation.
const SCENES = [structure, data, computation]

const INTRO = 1.8 // seconds for the first scale to draw itself in
const STILL_AT = 0.9 // reduced motion: first scale, fully drawn and annotated

/**
 * The scale zoom as a live SVG drawing (see zoom/engine.js): three chapters
 * — structure, data, computation — each zooming from a whole system down
 * to its smallest unit, the same way of seeing applied to each discipline.
 *
 * Playback: `start()` (via ref) draws the first scale in, then loops. With
 * `autoStart` it begins on mount. It only animates while on screen, and
 * holds a single annotated frame for reduced-motion visitors. Colours are
 * theme tokens, so it follows light / dark without re-rendering.
 *
 * The readout carries each scale's title in the site's own type, so it
 * stays legible however the drawing is cropped to its container.
 */
const ScaleZoom = forwardRef(function ScaleZoom(
  { autoStart = true, sheet = false, className = "", svgClassName = "", readoutClassName = "" },
  ref
) {
  const svgRef = useRef(null)
  const startRef = useRef(() => {})
  const [pos, setPos] = useState({ scene: 0, level: 0 })

  useImperativeHandle(ref, () => ({ start: () => startRef.current() }), [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const zoom = createScaleZoom(svg, SCENES, {
      sheet,
      onLevel: (scene, level) => setPos({ scene, level })
    })
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduce) {
      zoom.render(STILL_AT)
      startRef.current = () => {}
      return
    }

    let phase = "idle" // idle → intro → loop
    let intro = 0
    let t = 0
    let last = null
    let raf = 0
    let visible = true

    const frame = (ts) => {
      raf = 0
      if (!visible || phase === "idle") return
      const now = ts / 1000
      const dt = last === null ? 0 : Math.min(now - last, 1 / 30)
      last = now
      if (phase === "intro") {
        intro = Math.min(intro + dt / INTRO, 1)
        zoom.drawIn(intro)
        if (intro >= 1) phase = "loop"
      } else {
        t = (t + dt) % zoom.duration
        zoom.render(t)
      }
      raf = requestAnimationFrame(frame)
    }
    const wake = () => {
      if (raf || !visible || phase === "idle") return
      last = null
      raf = requestAnimationFrame(frame)
    }

    zoom.drawIn(0)
    startRef.current = () => {
      if (phase !== "idle") return
      phase = "intro"
      wake()
    }

    // Off screen, it costs nothing.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) wake()
      else if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    })
    io.observe(svg)

    if (autoStart) startRef.current()

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      startRef.current = () => {}
    }
  }, [autoStart, sheet])

  const scene = SCENES[pos.scene]
  const current = scene.levels[pos.level]

  return (
    <div className={`${styles.wrap} ${className}`}>
      <svg
        ref={svgRef}
        className={`${styles.svg} ${svgClassName}`}
        viewBox="0 0 1920 1200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      />
      <div className={`${styles.readout} ${readoutClassName}`} aria-hidden="true">
        <span className={styles.fig}>
          FIG. {pos.scene + 1}.{pos.level + 1}
        </span>
        <span className={styles.mask}>
          <span key={`${pos.scene}-${pos.level}`} className={styles.value}>
            {scene.name} — <span className={styles.scale}>{current.scale}</span> — {current.title}
          </span>
        </span>
      </div>
    </div>
  )
})

export default ScaleZoom

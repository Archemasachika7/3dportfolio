"use client"

import { useEffect, useRef } from "react"
import { gsap, registerMotion, prefersReducedMotion } from "../lib/motion"
import styles from "./CoordinateField.module.css"

/**
 * Shared, mutable state other components tween with GSAP:
 *   boost — 0..1, how strongly the field reads (the hero intro raises it)
 *   exit  — 0..1, scroll-driven fade of that boost (the hero exit)
 *   drift — multiplier on scroll-coupled drift (the hero exit spikes it)
 * Intro and exit write separate values, so scrolling during the intro
 * never has two tweens fighting over the same number.
 */
export const fieldState = { boost: 0, exit: 0, drift: 1 }

const GRID = 64 // matches --grid-size
const DRIFT = 0.12 // grid travels at 12% of scroll speed: felt, not seen

/**
 * The site's background: the existing coordinate grid, lifted into one fixed
 * layer behind every page. It drifts a fraction of scroll distance so the
 * page reads as sliding over a drawing surface, and gains density while the
 * hero is on screen. Transform + opacity only; writes are skipped on frames
 * where nothing changed.
 */
export default function CoordinateField() {
  const rootRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => {
    registerMotion()
    const root = rootRef.current
    const grid = gridRef.current
    if (!root || !grid) return

    const reduce = prefersReducedMotion()
    let lastY = window.scrollY
    let offset = 0
    let shownOffset = null
    let shownBoost = null

    const render = () => {
      const y = window.scrollY
      if (!reduce) {
        // Accumulate rather than derive from scrollY so a change in drift
        // speed accelerates the grid instead of making it jump.
        offset = (((offset + (y - lastY) * DRIFT * fieldState.drift) % GRID) + GRID) % GRID
      }
      lastY = y

      const o = Math.round(offset * 10) / 10
      if (o !== shownOffset) {
        grid.style.transform = `translate3d(0, ${-o}px, 0)`
        shownOffset = o
      }
      const b = Math.round(fieldState.boost * (1 - fieldState.exit) * 1000) / 1000
      if (b !== shownBoost) {
        root.style.setProperty("--boost", b)
        shownBoost = b
      }
    }

    render()
    gsap.ticker.add(render)
    return () => gsap.ticker.remove(render)
  }, [])

  return (
    <div ref={rootRef} className={styles.field} aria-hidden="true">
      <div ref={gridRef} className={styles.grid}>
        <div className={styles.major} />
        <div className={styles.minor} />
      </div>
    </div>
  )
}

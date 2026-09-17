"use client"

import { useEffect, useRef } from "react"
import styles from "./CursorSystem.module.css"

/**
 * Restrained custom cursor for fine-pointer (desktop/trackpad) devices.
 * State is read from `data-cursor` on the hovered element:
 *   "interactive" | "project" | "node"
 * Anything else falls back to the default dot.
 */
export default function CursorSystem() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (!isFinePointer || reduceMotion) return

    document.body.classList.add("cursor-enabled")
    document.body.style.cursor = "none"

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let ringX = x
    let ringY = y
    let raf

    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current

    const applyState = (state, text) => {
      ring.dataset.state = state || "default"
      label.textContent = text || ""
    }

    const onMove = (event) => {
      x = event.clientX
      y = event.clientY
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`

      const target = event.target.closest?.("[data-cursor]")
      applyState(target?.dataset.cursor, target?.dataset.cursorLabel)
    }

    const tick = () => {
      ringX += (x - ringX) * 0.18
      ringY += (y - ringY) * 0.18
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener("mousemove", onMove)
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(raf)
      document.body.classList.remove("cursor-enabled")
      document.body.style.cursor = ""
    }
  }, [])

  return (
    <div className={styles.wrap} aria-hidden="true">
      <div ref={dotRef} className={styles.dot} />
      <div ref={ringRef} className={styles.ring} data-state="default">
        <span ref={labelRef} className={styles.ringLabel} />
      </div>
    </div>
  )
}

"use client"

import { useEffect, useRef } from "react"
import styles from "./CursorSystem.module.css"

const LERP = 0.2 // ring follow: lags the dot just enough to read as weight
const NODE_PULL = 0.35 // how far the ring is drawn toward a hovered node

// Where the native cursor is the better tool: text entry and the CAD canvas
// (orbit/drag). The custom cursor steps aside there.
const NATIVE = "input, textarea, select, canvas, [contenteditable='true'], [data-cursor='native']"

/**
 * Restrained custom cursor for fine pointers. State comes from `data-cursor`
 * on the element under the pointer:
 *   default      small dot, hairline ring trailing it
 *   interactive  ring opens slightly and takes the accent
 *   project      ring becomes a plate carrying `data-cursor-label`
 *   node         ring is drawn toward the node, a hairline connects them,
 *                the label reads beside it (anchor: `[data-cursor-anchor]`
 *                inside the target, else the target itself)
 *
 * Positions are transforms written from one rAF loop that stops once the
 * ring has settled; size changes are CSS scale transitions. The target is
 * re-resolved on scroll, so the state is right even when content moves
 * under a stationary pointer.
 */
export default function CursorSystem() {
  const rootRef = useRef(null)
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)
  const linkRef = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduce) return

    const root = rootRef.current
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    const link = linkRef.current
    const html = document.documentElement
    html.classList.add("cursor-enabled")

    let px = 0
    let py = 0
    let rx = 0
    let ry = 0
    let visible = false
    let raf = 0
    let target = null
    let anchor = null
    let state = "default"

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const setState = (next, text) => {
      state = next
      root.dataset.state = next
      label.textContent = next === "project" || next === "node" ? text || "" : ""
      wake()
    }

    const resolve = (el) => {
      if (!el) return
      if (el.closest?.(NATIVE)) {
        target = null
        anchor = null
        if (state !== "native") setState("native")
        return
      }
      const t = el.closest?.("[data-cursor]") ?? null
      if (t === target && state !== "native") return
      target = t
      const next = t?.dataset.cursor || "default"
      anchor = next === "node" ? t.querySelector("[data-cursor-anchor]") || t : null
      setState(next, t?.dataset.cursorLabel)
    }

    function tick() {
      raf = 0
      let tx = px
      let ty = py
      let len = 0
      let angle = 0

      // Read before writing, so measuring the node never forces a layout.
      if (state === "node" && anchor) {
        const r = anchor.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        tx = px + (cx - px) * NODE_PULL
        ty = py + (cy - py) * NODE_PULL
        len = Math.hypot(cx - px, cy - py)
        angle = Math.atan2(cy - py, cx - px)
      }

      rx += (tx - rx) * LERP
      ry += (ty - ry) * LERP
      dot.style.transform = `translate3d(${px}px, ${py}px, 0)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      link.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${angle}rad) scaleX(${len})`

      const settled = Math.abs(tx - rx) < 0.1 && Math.abs(ty - ry) < 0.1
      // A hovered node can move (hover shift, scroll), so keep tracking it.
      if (!settled || state === "node") wake()
    }

    const onMove = (e) => {
      px = e.clientX
      py = e.clientY
      if (!visible) {
        visible = true
        rx = px
        ry = py
        root.dataset.visible = "true"
      }
      resolve(e.target)
      wake()
    }

    const onOut = (e) => {
      if (e.relatedTarget) return // moved between elements, still in the window
      visible = false
      root.dataset.visible = "false"
    }

    let scrollQueued = false
    const onScroll = () => {
      if (!visible || scrollQueued) return
      scrollQueued = true
      requestAnimationFrame(() => {
        scrollQueued = false
        resolve(document.elementFromPoint(px, py))
      })
    }

    const onDown = () => (root.dataset.pressed = "true")
    const onUp = () => (root.dataset.pressed = "false")

    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerout", onOut)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("pointerdown", onDown)
    window.addEventListener("pointerup", onUp)

    return () => {
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerout", onOut)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", onUp)
      cancelAnimationFrame(raf)
      html.classList.remove("cursor-enabled")
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className={styles.cursor}
      data-state="default"
      data-visible="false"
      data-pressed="false"
      aria-hidden="true"
    >
      <div ref={linkRef} className={styles.link} />
      <div ref={ringRef} className={styles.ring}>
        <span className={styles.ringShape} />
        <span ref={labelRef} className={styles.label} />
      </div>
      <div ref={dotRef} className={styles.dot} />
    </div>
  )
}

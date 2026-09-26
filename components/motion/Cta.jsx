"use client"

import { useRef } from "react"
import useMotion from "../../hooks/useMotion"
import { gsap, hasFinePointer } from "../../lib/motion"
import styles from "./Cta.module.css"

/**
 * Call-to-action link with two restrained behaviours on fine pointers:
 *   - magnetic: drifts a few pixels toward the pointer, settles on leave
 *   - directional fill: the ink wipe enters from the side the pointer came
 *     from and leaves toward the side it exits
 * Touch and reduced-motion visitors get a plain, fully functional link.
 */
export default function Cta({ href, children, variant = "solid", strength = 0.28, ...rest }) {
  const ref = useRef(null)

  useMotion(
    ref,
    ({ reduce, mobile }) => {
      const el = ref.current
      if (reduce || mobile || !hasFinePointer()) return

      const xTo = gsap.quickTo(el, "x", { duration: 0.45 })
      const yTo = gsap.quickTo(el, "y", { duration: 0.45 })
      let rect = null

      // Which edge is the pointer nearest? Drives the wipe's origin.
      const side = (e) => {
        const r = el.getBoundingClientRect()
        const dx = (e.clientX - r.left) / r.width - 0.5
        const dy = (e.clientY - r.top) / r.height - 0.5
        return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "top" : "bottom"
      }

      const enter = (e) => {
        rect = el.getBoundingClientRect() // measured at rest, before any drift
        el.dataset.from = side(e)
        el.dataset.hover = "true"
      }
      const move = (e) => {
        if (!rect) return
        xTo((e.clientX - (rect.left + rect.width / 2)) * strength)
        yTo((e.clientY - (rect.top + rect.height / 2)) * strength)
      }
      const leave = (e) => {
        el.dataset.from = side(e)
        el.dataset.hover = "false"
        xTo(0)
        yTo(0)
        rect = null
      }

      el.addEventListener("pointerenter", enter)
      el.addEventListener("pointermove", move)
      el.addEventListener("pointerleave", leave)
      return () => {
        el.removeEventListener("pointerenter", enter)
        el.removeEventListener("pointermove", move)
        el.removeEventListener("pointerleave", leave)
      }
    },
    [strength]
  )

  return (
    <a
      ref={ref}
      href={href}
      className={styles.cta}
      data-variant={variant}
      data-hover="false"
      data-from="left"
      data-cursor="interactive"
      {...rest}
    >
      <span className={styles.fill} aria-hidden="true" />
      <span className={styles.text}>{children}</span>
    </a>
  )
}

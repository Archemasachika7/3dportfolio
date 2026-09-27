"use client"

import { useRef } from "react"
import useMotion, { setScope } from "../../hooks/useMotion"
import { gsap, EASE } from "../../lib/motion"
import styles from "./SectionTransition.module.css"

/**
 * A structural line crosses the full viewport between two sections, its
 * leading node reporting its own x-coordinate. As it arrives, the line
 * settles into a divider and drops a branch into the next section — the
 * same line the next section then grows from. Scrubbed on desktop, played
 * once on small screens, drawn and still for reduced motion.
 */
export default function SectionTransition({ from, to }) {
  const ref = useRef(null)

  useMotion(
    ref,
    ({ reduce, mobile }) => {
      const root = ref.current
      if (reduce) return setScope(root, "static")

      const q = gsap.utils.selector(root)
      const readout = q("[data-readout]")[0]
      const width = () => root.offsetWidth

      gsap.set(q("[data-line]"), { scaleX: 0 })
      gsap.set(q("[data-head]"), { x: 0, autoAlpha: 1 })
      gsap.set(q("[data-center]"), { scale: 0 })
      gsap.set(q("[data-drop]"), { scaleY: 0 })
      gsap.set(q("[data-caption]"), { autoAlpha: 0, y: 6 })
      setScope(root, "live")

      const pad = (n) => String(Math.round(n)).padStart(4, "0")
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: mobile
          ? { trigger: root, start: "top 80%", once: true }
          : { trigger: root, start: "top 85%", end: "bottom 40%", scrub: 0.6 },
        onUpdate() {
          if (readout) readout.textContent = `X ${pad(this.progress() * width())}`
        }
      })

      tl.to(q("[data-line]"), { scaleX: 1, duration: 1 }, 0)
        .to(q("[data-head]"), { x: width, duration: 1 }, 0)
        .to(q("[data-head]"), { autoAlpha: 0, duration: 0.12 }, 0.9)
        .to(q("[data-center]"), { scale: 1, duration: 0.18, ease: EASE.uiOut }, 0.72)
        .to(q("[data-drop]"), { scaleY: 1, duration: 0.3, ease: EASE.out }, 0.8)
        .to(q("[data-caption]"), { autoAlpha: 1, y: 0, duration: 0.2, ease: EASE.out }, 0.78)

      if (mobile) tl.duration(1.6)
    },
    []
  )

  return (
    <div ref={ref} className={styles.transition} data-motion-scope="pending" aria-hidden="true">
      <span className={styles.line} data-line data-reveal />
      <span className={styles.tick} data-side="start" />
      <span className={styles.tick} data-side="end" />
      <span className={styles.head} data-head data-reveal>
        <span className={styles.headDot} />
        <span className={styles.readout} data-readout>
          X 0000
        </span>
      </span>
      <span className={styles.center} data-center data-reveal />
      <span className={styles.drop} data-drop data-reveal />
      {(from || to) && (
        <span className={styles.caption} data-caption data-reveal>
          {from}
          {from && to && <span className={styles.arrow}>→</span>}
          {to}
        </span>
      )}
    </div>
  )
}

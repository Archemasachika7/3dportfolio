"use client"

import { useRef } from "react"
import useMotion, { setScope } from "../../hooks/useMotion"
import { gsap, splitLines, EASE } from "../../lib/motion"
import styles from "./SectionHeader.module.css"

/**
 * The opening phrase every homepage section shares — the grammar that makes
 * the page read as one drawing rather than a stack of blocks:
 *
 *   01  /  EDUCATION  ────────────────────────●     index, typed label,
 *   THE FOUNDATION                                   a scale rule that extends,
 *                                                    a terminal node, then the
 *                                                    heading resolves line by line.
 *
 * `align="center"` mirrors the rule to both sides for centred sections.
 */
export default function SectionHeader({ index, label, lines, align = "left", as: Tag = "h2" }) {
  const ref = useRef(null)
  const headingKey = lines.join("|")

  useMotion(
    ref,
    ({ reduce, mobile }) => {
      const root = ref.current
      if (reduce) return setScope(root, "static")

      const q = gsap.utils.selector(root)
      const chars = q("[data-char]")
      const rules = q("[data-rule]")
      const nodes = q("[data-node]")
      const heading = q("[data-heading]")[0]

      const lines = splitLines(heading, { duration: mobile ? 0.8 : 1.05, stagger: 0.09 })

      gsap.set(q("[data-index]"), { autoAlpha: 0, x: -8 })
      gsap.set(chars, { autoAlpha: 0 })
      gsap.set(rules, { scaleX: 0 })
      gsap.set(nodes, { scale: 0 })
      gsap.set(heading, { autoAlpha: 1 })
      setScope(root, "live")

      gsap
        .timeline({ scrollTrigger: { trigger: root, start: "top 86%", once: true } })
        .to(q("[data-index]"), { autoAlpha: 1, x: 0, duration: 0.45 })
        .to(
          chars,
          { autoAlpha: 1, duration: 0.01, stagger: mobile ? 0.012 : 0.024, ease: "none" },
          "-=0.25"
        )
        .to(rules, { scaleX: 1, duration: mobile ? 0.6 : 0.95, ease: EASE.cinematic }, "-=0.35")
        .to(nodes, { scale: 1, duration: 0.4, ease: "back.out(2.4)" }, "-=0.3")
        .call(lines.play, null, "-=0.55")
    },
    [headingKey, label, index]
  )

  const chars = Array.from(label)

  return (
    <header ref={ref} className={styles.header} data-align={align} data-motion-scope="pending">
      <div className={styles.row}>
        {align === "center" && (
          <>
            <span className={styles.node} data-node aria-hidden="true" />
            <span className={styles.rule} data-rule data-side="left" aria-hidden="true" />
          </>
        )}

        <span className={styles.index} data-index data-reveal>
          {index}
        </span>
        <span className={styles.slash} aria-hidden="true">
          /
        </span>
        <span className={styles.label} aria-label={label}>
          {chars.map((c, i) => (
            <span key={i} data-char data-reveal aria-hidden="true">
              {c === " " ? " " : c}
            </span>
          ))}
        </span>

        <span className={styles.rule} data-rule data-side="right" aria-hidden="true" />
        <span className={styles.node} data-node aria-hidden="true" />
      </div>

      <Tag key={headingKey} className={styles.heading} data-heading data-reveal>
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </Tag>
    </header>
  )
}

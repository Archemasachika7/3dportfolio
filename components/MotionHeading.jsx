"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import useReducedMotion from "../hooks/useReducedMotion"

/**
 * Editorial masked-text reveal. Pass either a single string as children
 * or an array of strings to reveal as separate lines, each masked by an
 * overflow-hidden wrapper and translated up into place.
 *
 * Visibility is tracked on the heading tag itself rather than via
 * `whileInView` on the animated line: the line's own resting state sits
 * translated out of its overflow-hidden mask, so observing the line
 * directly would make it permanently "offscreen" to its own trigger.
 */
export default function MotionHeading({
  as: Tag = "h2",
  lines,
  children,
  delay = 0,
  stagger = 0.08,
  className = "",
  once = true,
  viewportAmount = 0.3
}) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once, amount: viewportAmount })
  const items = lines || (Array.isArray(children) ? children : [children])

  if (reduced) {
    return (
      <Tag className={className}>
        {items.map((line, i) => (
          <span key={i} style={{ display: "block" }}>
            {line}
          </span>
        ))}
      </Tag>
    )
  }

  return (
    <Tag ref={ref} className={className}>
      {items.map((line, i) => (
        <span key={i} style={{ display: "block", overflow: "hidden" }}>
          <motion.span
            style={{ display: "block" }}
            initial={{ y: "100%" }}
            animate={inView ? { y: "0%" } : undefined}
            transition={{
              duration: 0.8,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

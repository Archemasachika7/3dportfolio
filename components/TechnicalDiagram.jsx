"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import useReducedMotion from "../hooks/useReducedMotion"
import styles from "./TechnicalDiagram.module.css"

/**
 * A short micro-sequence of labels connected by a line, reused across
 * domains (structural steps, data pipeline steps, ...). Steps light up
 * in order once the diagram scrolls into view.
 */
export default function TechnicalDiagram({ steps = [] }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const revealed = inView || reduced

  return (
    <div ref={ref} className={styles.diagram}>
      {steps.map((step, i) => (
        <motion.div
          key={step}
          className={styles.step}
          initial={{ opacity: 0, x: -6 }}
          animate={revealed ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: reduced ? 0 : i * 0.12 }}
        >
          <span className={styles.dot} />
          <span className={`font-mono ${styles.stepLabel}`}>{step}</span>
          {i < steps.length - 1 && <span className={styles.connector} />}
        </motion.div>
      ))}
    </div>
  )
}

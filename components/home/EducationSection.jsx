"use client"

import { motion } from "framer-motion"
import LineSegment from "../LineSegment"
import TimelineNode from "../TimelineNode"
import MotionHeading from "../MotionHeading"
import styles from "./EducationSection.module.css"

function yearRange(item) {
  if (!item.start_year) return null
  return item.end_year ? `${item.start_year} — ${item.end_year}` : `${item.start_year} — PRESENT`
}

export default function EducationSection({ education = [] }) {
  return (
    <section className={styles.section} aria-label="Education">
      <div className={styles.intro}>
        <span className="label">01 / EDUCATION</span>
        <MotionHeading as="h2" className={styles.heading} lines={["THE FOUNDATION"]} />
      </div>

      {education.length === 0 ? (
        <p className={styles.empty}>Education timeline — awaiting content.</p>
      ) : (
        <div className={styles.timeline}>
          <div className={styles.rail}>
            <LineSegment start="top 90%" end="bottom 25%" />
          </div>

          <div className={styles.nodes}>
            {education.map((item) => (
              <TimelineNode key={item.id} label={yearRange(item) ?? ""}>
                <p className={styles.institution}>{item.institution}</p>
                <p className={styles.discipline}>
                  {[item.degree, item.field].filter(Boolean).join(" — ")}
                </p>

                {item.cgpa && (
                  <div className={styles.metrics}>
                    <motion.div
                      className={styles.metric}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="label">CGPA</span>
                      <span className={styles.metricValue}>{item.cgpa}</span>
                    </motion.div>
                  </div>
                )}
              </TimelineNode>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

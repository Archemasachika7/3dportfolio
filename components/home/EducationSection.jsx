"use client"

import { motion } from "framer-motion"
import LineSegment from "../LineSegment"
import TimelineNode from "../TimelineNode"
import MotionHeading from "../MotionHeading"
import { education } from "../../data/career"
import styles from "./EducationSection.module.css"

export default function EducationSection() {
  return (
    <section className={styles.section} aria-label="Education">
      <div className={styles.intro}>
        <span className="label">01 / EDUCATION</span>
        <MotionHeading as="h2" className={styles.heading} lines={["THE FOUNDATION"]} />
      </div>

      <div className={styles.timeline}>
        <div className={styles.rail}>
          <LineSegment start="top 90%" end="bottom 25%" />
        </div>

        <div className={styles.nodes}>
          {education.map((item) => (
            <TimelineNode key={item.id} label={item.year}>
              <p className={styles.institution}>{item.institution}</p>
              <p className={styles.discipline}>{item.discipline}</p>

              {item.metrics && (
                <div className={styles.metrics}>
                  {item.metrics.map((m) => (
                    <motion.div
                      key={m.label}
                      className={styles.metric}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="label">{m.label}</span>
                      <span className={styles.metricValue}>{m.value}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </TimelineNode>
          ))}
        </div>
      </div>
    </section>
  )
}

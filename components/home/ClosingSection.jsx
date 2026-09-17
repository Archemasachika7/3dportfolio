"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import MotionHeading from "../MotionHeading"
import { closingStatement, closingLinks, identity } from "../../data/career"
import styles from "./ClosingSection.module.css"

export default function ClosingSection() {
  return (
    <section className={styles.section} aria-label="Closing">
      <Image
        src="/images/closing/build-analyse-optimise.png"
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        className={styles.backdrop}
      />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.converge}>
        <span className={styles.stub} data-i="0" aria-hidden="true" />
        <span className={styles.stub} data-i="1" aria-hidden="true" />
        <span className={styles.stub} data-i="2" aria-hidden="true" />
        <span className={styles.stub} data-i="3" aria-hidden="true" />
      </div>
      <span className={styles.crossbar} aria-hidden="true" />
      <span className={styles.trunk} aria-hidden="true" />

      <span className="label">05 / SYSTEM / END</span>

      <MotionHeading
        as="h2"
        className={styles.statement}
        lines={[closingStatement.join(" → ")]}
      />

      <motion.nav
        className={styles.links}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6 }}
        aria-label="Contact and profiles"
      >
        {closingLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={styles.link}
            data-cursor="interactive"
          >
            {link.label}
          </a>
        ))}
      </motion.nav>

      <p className={styles.signature}>{identity.name}</p>
    </section>
  )
}

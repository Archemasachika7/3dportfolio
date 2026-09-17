"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { identity } from "../../data/career"
import useReducedMotion from "../../hooks/useReducedMotion"
import styles from "./IntroSequence.module.css"

const easeOut = [0.16, 1, 0.3, 1]

function HeroVisual() {
  return (
    <div className={styles.heroVisual} aria-hidden="true">
      <Image
        src="/images/hero/structural-hero.png"
        alt=""
        fill
        priority
        sizes="(max-width: 900px) 100vw, 54vw"
        className={styles.heroVisualImg}
      />
    </div>
  )
}

function StaticHero() {
  return (
    <section className={styles.hero} aria-label="Introduction">
      <HeroVisual />
      <div className={`bg-grid ${styles.grid}`} />
      <span className={`label ${styles.systemTag}`}>{identity.systemTag}</span>
      <span className={`label ${styles.fileTag}`}>{identity.fileTag}</span>

      <div className={styles.center}>
        <div className={styles.nameMask}>
          <h1 className={styles.name}>{identity.name}</h1>
        </div>
        <p className={`label ${styles.descriptor}`}>{identity.descriptor}</p>
        <div className={styles.baseline} />
      </div>

      <div className={styles.scrollCue}>
        <span className="label">SCROLL</span>
        <span className={styles.scrollLine} />
      </div>
    </section>
  )
}

function AnimatedHero() {
  return (
    <section className={styles.hero} aria-label="Introduction">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.2 }}
      >
        <HeroVisual />
      </motion.div>

      <motion.div
        className={`bg-grid ${styles.grid}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.1 }}
      />

      <motion.span
        className={`label ${styles.systemTag}`}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        {identity.systemTag}
      </motion.span>

      <motion.span
        className={`label ${styles.fileTag}`}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        {identity.fileTag}
      </motion.span>

      <div className={styles.center}>
        <div className={styles.nameMask}>
          <motion.h1
            className={styles.name}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1.1, delay: 0.7, ease: easeOut }}
          >
            {identity.name}
          </motion.h1>
        </div>

        <motion.p
          className={`label ${styles.descriptor}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.7 }}
        >
          {identity.descriptor}
        </motion.p>

        <motion.div
          className={styles.baseline}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 2.1, ease: easeOut }}
        />
      </div>

      <motion.div
        className={styles.scrollCue}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.6 }}
      >
        <span className="label">SCROLL</span>
        <span className={styles.scrollLine} />
      </motion.div>
    </section>
  )
}

export default function IntroSequence() {
  const reduced = useReducedMotion()
  return reduced ? <StaticHero /> : <AnimatedHero />
}

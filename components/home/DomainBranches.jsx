"use client"

import { useState } from "react"
import Image from "next/image"
import LineSegment from "../LineSegment"
import MotionHeading from "../MotionHeading"
import { branches } from "../../data/career"
import styles from "./DomainBranches.module.css"

export default function DomainBranches() {
  const [active, setActive] = useState(null)

  return (
    <section className={styles.section} aria-label="Domains">
      <div className={styles.intro}>
        <span className="label">02 / ONE FOUNDATION — MULTIPLE APPLICATIONS</span>
        <MotionHeading as="h2" className={styles.heading} lines={["THE LINE BRANCHES"]} />
      </div>

      <div className={styles.atmosphere}>
        <Image
          src="/images/domains/one-foundation-four-domains.png"
          alt=""
          fill
          loading="lazy"
          sizes="(max-width: 960px) 100vw, 1180px"
          className={styles.atmosphereImg}
        />
      </div>

      <div className={styles.trunk}>
        <LineSegment start="top 90%" end="bottom 55%" />
      </div>

      <span className={styles.crossbar} aria-hidden="true" />

      <div className={styles.grid}>
        {branches.map((branch) => (
          <div
            key={branch.id}
            className={styles.branch}
            data-dim={active && active !== branch.id ? "true" : "false"}
            data-cursor="interactive"
            onMouseEnter={() => setActive(branch.id)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(branch.id)}
            onBlur={() => setActive(null)}
            tabIndex={0}
          >
            <span className={styles.stub} aria-hidden="true" />
            <span className="label">{branch.label}</span>
            <p className={styles.summary}>{branch.summary}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

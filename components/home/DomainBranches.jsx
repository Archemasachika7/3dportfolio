"use client"

import { useState } from "react"
import LineSegment from "../LineSegment"
import MotionHeading from "../MotionHeading"
import MotionMedia from "../MotionMedia"
import styles from "./DomainBranches.module.css"

// Short connective copy per domain — presentational only, not "career
// facts". The domains themselves, their order and their tags all come
// from Supabase (domain_nodes); this is just fallback marketing text
// for when a node has no admin-entered description yet.
const SUMMARY_BY_SLUG = {
  engineering: "Structural systems, seismic design, computational modelling.",
  "data-ai": "Statistical modelling, machine learning, applied inference.",
  "business-analytics": "Decision systems, optimisation, market and operations analysis.",
  leadership: "Building and running teams, ventures, and student organisations."
}

// domain_node.slug -> homepage_media.section_key for the per-card visual.
const MEDIA_KEY_BY_SLUG = {
  engineering: "engineering",
  "data-ai": "data",
  "business-analytics": "analytics",
  leadership: "leadership"
}

const FALLBACK_IMAGE_BY_SLUG = {
  engineering: "/images/projects/seismic-tower-cover.png",
  "data-ai": "/images/projects/data-insight-cover.png",
  "business-analytics": "/images/projects/analytics-decisions-cover.png",
  leadership: "/images/projects/leadership-cover.png"
}

export default function DomainBranches({ domainNodes = [], media = {} }) {
  const [active, setActive] = useState(null)

  return (
    <section className={styles.section} aria-label="Domains">
      <div className={styles.intro}>
        <span className="label">02 / ONE FOUNDATION — MULTIPLE APPLICATIONS</span>
        <MotionHeading as="h2" className={styles.heading} lines={["THE LINE BRANCHES"]} />
      </div>

      <div className={styles.atmosphere}>
        <MotionMedia
          media={media?.domains}
          fallbackSrc="/images/domains/one-foundation-four-domains.png"
          className={styles.atmosphereImg}
        />
      </div>

      {domainNodes.length === 0 ? (
        <p className={styles.empty}>Career map — awaiting content.</p>
      ) : (
        <>
          <div className={styles.trunk}>
            <LineSegment start="top 90%" end="bottom 55%" />
          </div>

          <span className={styles.crossbar} aria-hidden="true" />

          <div className={styles.grid}>
            {domainNodes.map((node) => (
              // Opens the map with this domain preselected, which surfaces
              // the resume tagged for that path along with its work.
              <a
                key={node.id}
                href={`/map?node=${encodeURIComponent(node.slug)}`}
                className={styles.branch}
                data-dim={active && active !== node.slug ? "true" : "false"}
                data-cursor="interactive"
                onMouseEnter={() => setActive(node.slug)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(node.slug)}
                onBlur={() => setActive(null)}
              >
                <span className={styles.stub} aria-hidden="true" />
                <div className={styles.branchVisual}>
                  <MotionMedia
                    media={media?.[MEDIA_KEY_BY_SLUG[node.slug]]}
                    fallbackSrc={FALLBACK_IMAGE_BY_SLUG[node.slug] ?? "/images/domains/one-foundation-four-domains.png"}
                    className={styles.branchVisualImg}
                  />
                </div>
                <span className="label">{node.label}</span>
                <p className={styles.summary}>
                  {node.description || SUMMARY_BY_SLUG[node.slug] || ""}
                </p>
                <span className={styles.cue}>RESUME &amp; WORK →</span>
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

"use client"

import { useRef } from "react"
import MotionMedia from "../MotionMedia"
import useMotion, { setScope } from "../../hooks/useMotion"
import { gsap, EASE, revealOnFocus } from "../../lib/motion"
import { closingStatement, closingLinks, identity } from "../../data/career"
import styles from "./ClosingSection.module.css"

// Profile columns that supply each link's real destination. A link whose
// destination is still the "#" placeholder and has no profile value is
// left out rather than rendered dead.
const PROFILE_HREF = {
  GITHUB: (p) => p?.github_url,
  LINKEDIN: (p) => p?.linkedin_url,
  CONTACT: (p) => (p?.email ? `mailto:${p.email}` : null)
}

/**
 * The system closes: four branch stubs converge onto a crossbar, a single
 * trunk leaves it, and the statement is set word by word along that line
 * with its arrows drawn between. Links and signature follow.
 */
export default function ClosingSection({ profile, media }) {
  const ref = useRef(null)
  const name = profile?.name || identity.name
  const links = closingLinks
    .map((link) => ({ ...link, href: PROFILE_HREF[link.label]?.(profile) || link.href }))
    .filter((link) => link.href && link.href !== "#")

  useMotion(
    ref,
    ({ reduce, mobile }) => {
      const root = ref.current
      if (reduce) return setScope(root, "static")
      const q = gsap.utils.selector(root)

      gsap.set(q("[data-stub]"), { scaleY: 0 })
      gsap.set(q("[data-crossbar]"), { scaleX: 0 })
      gsap.set(q("[data-trunk]"), { scaleY: 0 })
      gsap.set(q("[data-label]"), { autoAlpha: 0 })
      gsap.set(q("[data-word]"), { yPercent: 110 })
      gsap.set(q("[data-arrow]"), { autoAlpha: 0, x: -10 })
      gsap.set(q("[data-statement]"), { autoAlpha: 1 })
      gsap.set(q("[data-link]"), { opacity: 0, y: 8 }) // opacity: links stay tabbable
      gsap.set(q("[data-signature]"), { autoAlpha: 0 })
      setScope(root, "live")

      const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: mobile ? "top 75%" : "top 65%", once: true } })
      tl
        .to(q("[data-stub]"), { scaleY: 1, duration: 0.45, stagger: { each: 0.05, from: "edges" }, ease: EASE.cinematic })
        .to(q("[data-crossbar]"), { scaleX: 1, duration: 0.5, ease: EASE.cinematic }, "-=0.2")
        .to(q("[data-trunk]"), { scaleY: 1, duration: 0.35, ease: EASE.out }, "-=0.15")
        .to(q("[data-label]"), { autoAlpha: 1, duration: 0.3 }, "-=0.15")
        .to(q("[data-word]"), { yPercent: 0, duration: 0.7, stagger: 0.1 }, "-=0.15")
        .to(q("[data-arrow]"), { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.1 }, "<0.15")
        // Links arrive while the statement is still settling: the page's
        // last actions shouldn't wait on the flourish.
        .to(q("[data-link]"), { opacity: 1, y: 0, duration: 0.45, stagger: 0.05 }, "-=0.55")
        .to(q("[data-signature]"), { autoAlpha: 1, duration: 0.6 }, "-=0.2")
      return revealOnFocus(root, tl)
    },
    [links.length]
  )

  return (
    <section ref={ref} className={styles.section} aria-label="Closing" data-motion-scope="pending">
      <MotionMedia
        media={media?.closing}
        fallbackSrc="/images/closing/build-analyse-optimise.png"
        className={styles.backdrop}
      />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.converge} aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={styles.stub} data-stub data-reveal />
        ))}
      </div>
      <span className={styles.crossbar} data-crossbar data-reveal aria-hidden="true" />
      <span className={styles.trunk} data-trunk data-reveal aria-hidden="true" />

      <span className="label" data-label data-reveal>
        05 / SYSTEM / END
      </span>

      <h2 className={styles.statement} data-statement data-reveal aria-label={closingStatement.join(", ")}>
        {closingStatement.map((word, i) => (
          <span key={word} className={styles.group} aria-hidden="true">
            {i > 0 && (
              <span className={styles.arrow} data-arrow>
                →
              </span>
            )}
            <span className={styles.wordMask}>
              <span className={styles.word} data-word>
                {word}
              </span>
            </span>
          </span>
        ))}
      </h2>

      <nav className={styles.links} aria-label="Contact and profiles">
        {links.map((link) => {
          const external = /^https?:/.test(link.href)
          return (
            <a
              key={link.label}
              href={link.href}
              className={`link-draw ${styles.link}`}
              data-link
              data-reveal
              data-cursor="interactive"
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link.label}
            </a>
          )
        })}
      </nav>

      <p className={styles.signature} data-signature data-reveal>
        {name}
      </p>
    </section>
  )
}

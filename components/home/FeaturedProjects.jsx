"use client"

import { useRef } from "react"
import SectionHeader from "../motion/SectionHeader"
import MotionMedia from "../MotionMedia"
import ProjectReveal from "./ProjectReveal"
import useMotion, { setScope } from "../../hooks/useMotion"
import { gsap, ScrollTrigger, EASE } from "../../lib/motion"
import styles from "./FeaturedProjects.module.css"

/**
 * The selected work as a reel. On desktop a slim bar rides under the nav
 * while the list is in view — case counter, current title, a progress rule
 * — so the projects read as one continuous sequence rather than a stack.
 * The section closes on a large transition: the integrated-solutions image
 * opens from a framed plate to the full width of the screen.
 */
export default function FeaturedProjects({ projects = [], media = {} }) {
  const ref = useRef(null)
  const total = projects.length

  useMotion(
    ref,
    ({ reduce, desktop }) => {
      const root = ref.current
      const q = gsap.utils.selector(root)
      if (reduce) return setScope(root, "static")

      // ---- bridge: framed plate → full bleed, scrubbed ----
      const bridge = q("[data-bridge]")[0]
      gsap.set(q("[data-bridge-frame]"), {
        clipPath: desktop ? "inset(12% 26% 12% 26%)" : "inset(6% 8% 6% 8%)"
      })
      gsap.set(q("[data-bridge-media]"), { scale: 1.25 })
      gsap.set(q("[data-bridge-label]"), { autoAlpha: 0, y: 10 })
      setScope(root, "live")

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: bridge,
            start: "top 92%",
            end: desktop ? "center 45%" : "center 55%",
            scrub: 0.8
          }
        })
        .to(q("[data-bridge-frame]"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, 0)
        .to(q("[data-bridge-media]"), { scale: 1, duration: 1 }, 0)
        .to(q("[data-bridge-label]"), { autoAlpha: 1, y: 0, duration: 0.25 }, 0.8)

      if (!desktop || total === 0) return

      // ---- reel bar ----
      const bar = q("[data-reel]")[0]
      const counter = q("[data-reel-index]")[0]
      const title = q("[data-reel-title]")[0]
      const list = q("[data-list]")[0]
      gsap.set(bar, { autoAlpha: 0, yPercent: -100 })
      gsap.set(q("[data-reel-progress]"), { scaleX: 0 })

      let current = -1
      const show = (i) => {
        if (i === current) return
        const dir = i > current ? 1 : -1
        current = i
        counter.textContent = String(i + 1).padStart(2, "0")
        title.textContent = projects[i]?.title ?? ""
        gsap.fromTo([counter, title], { yPercent: 100 * dir }, { yPercent: 0, duration: 0.45, stagger: 0.04, ease: EASE.out, overwrite: true })
      }

      // Shown only while it is actually stuck under the nav (list top at the
      // bar's sticky line), so it never duplicates a case header in flow.
      ScrollTrigger.create({
        trigger: list,
        start: "top 96px",
        end: "bottom 96px",
        onToggle: (self) =>
          gsap.to(bar, { autoAlpha: self.isActive ? 1 : 0, yPercent: self.isActive ? 0 : -100, duration: 0.45, overwrite: true })
      })
      gsap.to(q("[data-reel-progress]"), {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: list, start: "top 96px", end: "bottom 96px", scrub: true }
      })
      q("[data-project]").forEach((el, i) =>
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && show(i)
        })
      )
    },
    [total]
  )

  return (
    <section ref={ref} id="work" className={styles.section} aria-label="Featured projects" data-motion-scope="pending">
      <SectionHeader index="04" label="SELECTED WORK" lines={["FEATURED PROJECTS"]} />

      {total > 0 && (
        <div className={styles.reel} data-reel aria-hidden="true">
          <span className={styles.reelLabel}>CASE</span>
          <span className={styles.reelMask}>
            <span className={styles.reelIndex} data-reel-index>
              01
            </span>
          </span>
          <span className={styles.reelTotal}>/ {String(total).padStart(2, "0")}</span>
          <span className={`${styles.reelMask} ${styles.reelTitleMask}`}>
            <span className={styles.reelTitle} data-reel-title>
              {projects[0]?.title}
            </span>
          </span>
          <span className={styles.reelTrack}>
            <span className={styles.reelProgress} data-reel-progress />
          </span>
        </div>
      )}

      {total === 0 ? (
        <p className={styles.empty}>No published projects yet.</p>
      ) : (
        <div className={styles.list} data-list>
          {projects.map((project, i) => (
            <ProjectReveal key={project.id} project={project} index={i} total={total} />
          ))}
        </div>
      )}

      <div className={styles.bridge} data-bridge>
        <div className={styles.bridgeFrame} data-bridge-frame>
          <span className={styles.bridgeMedia} data-bridge-media>
            <MotionMedia
              media={media?.integrated}
              fallbackSrc="/images/bridge/integrated-solutions.png"
              paper
              className={styles.bridgeImg}
            />
          </span>
          <span className={styles.bridgeLabel} data-bridge-label>
            WHAT CONNECTS THESE DISCIPLINES — INTEGRATED SOLUTIONS
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <a href="/work" className={`link-draw ${styles.allLink}`} data-cursor="interactive">
          ALL WORK →
        </a>
      </div>
    </section>
  )
}

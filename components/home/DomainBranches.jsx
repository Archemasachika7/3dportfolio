"use client"

import { useRef } from "react"
import SectionHeader from "../motion/SectionHeader"
import MotionMedia from "../MotionMedia"
import useMotion, { setScope } from "../../hooks/useMotion"
import { gsap, EASE, hasFinePointer, revealOnFocus } from "../../lib/motion"
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

/**
 * The domains as one system rather than four cards: an origin node feeds a
 * trunk, the trunk splits along a bus, and a branch drops to each domain's
 * node. The diagram's geometry is measured from the laid-out cards, so it
 * stays true at any width or domain count (branches connect the first row;
 * wrapped rows keep their own node).
 *
 * Hovering or focusing a domain is a signal travelling the system: its
 * path lights from the trunk, a pulse runs origin → node, the node opens,
 * and the neighbouring domains step aside.
 */
export default function DomainBranches({ domainNodes = [], media = {} }) {
  const ref = useRef(null)
  const count = String(domainNodes.length).padStart(2, "0")

  useMotion(
    ref,
    ({ reduce, desktop }) => {
      const root = ref.current
      const q = gsap.utils.selector(root)
      const diagram = q("[data-diagram]")[0]
      const grid = q("[data-grid]")[0]
      if (!diagram || !grid) return setScope(root, reduce ? "static" : "live")

      const cards = q("[data-branch]")
      const trunk = q("[data-trunk]")[0]
      const busL = q("[data-bus='left']")[0]
      const busR = q("[data-bus='right']")[0]
      const glow = q("[data-glow]")[0]
      const pulse = q("[data-pulse]")[0]

      // ---- geometry (desktop only: below that the grid wraps and the
      // diagram reduces to per-card nodes) ----
      let firstRow = []
      let trunkX = 0
      const layout = () => {
        if (!desktop) return
        const top0 = cards[0]?.offsetTop ?? 0
        firstRow = cards.filter((c) => c.offsetTop === top0)
        const xs = firstRow.map((c) => c.offsetLeft)
        trunkX = grid.offsetWidth / 2
        const minX = Math.min(trunkX, ...xs)
        const maxX = Math.max(trunkX, ...xs)
        Object.assign(busL.style, { left: `${minX}px`, width: `${trunkX - minX}px` })
        Object.assign(busR.style, { left: `${trunkX}px`, width: `${maxX - trunkX}px` })
        cards.forEach((c) => (c.dataset.connected = firstRow.includes(c) ? "true" : "false"))
      }
      layout()
      let ro
      if (desktop && "ResizeObserver" in window) {
        ro = new ResizeObserver(layout)
        ro.observe(grid)
      }

      // Hover/focus state is colour and emphasis, not motion, so it applies
      // under reduced motion too; the animated parts are layered on below.
      const mark = (card) => {
        root.dataset.active = card ? "true" : "false"
        cards.forEach((c) => (c.dataset.state = !card ? "idle" : c === card ? "active" : "dim"))
      }
      const bind = (on, off) => {
        const offs = cards.map((card) => {
          const enter = () => on(card)
          const leave = () => off(card)
          card.addEventListener("pointerenter", enter)
          card.addEventListener("pointerleave", leave)
          card.addEventListener("focus", enter)
          card.addEventListener("blur", leave)
          return () => {
            card.removeEventListener("pointerenter", enter)
            card.removeEventListener("pointerleave", leave)
            card.removeEventListener("focus", enter)
            card.removeEventListener("blur", leave)
          }
        })
        return () => offs.forEach((fn) => fn())
      }

      if (reduce) {
        setScope(root, "static")
        const unbind = bind(mark, () => mark(null))
        return () => {
          ro?.disconnect()
          unbind()
          mark(null)
        }
      }

      // ---- build-up on scroll ----
      const atmosphere = q("[data-atmosphere]")
      gsap.set(atmosphere, { clipPath: "inset(0% 50% 0% 50%)" })
      gsap.set(q("[data-atmosphere-img]"), { scale: 1.18 })
      gsap.set(q("[data-origin]"), { scale: 0 })
      gsap.set(q("[data-origin-label]"), { autoAlpha: 0, x: -6 })
      gsap.set(trunk, { scaleY: 0 })
      gsap.set([busL, busR], { scaleX: 0 })
      gsap.set(q("[data-drop]"), { scaleY: 0 })
      gsap.set(q("[data-node]"), { scale: 0 })
      gsap.set(q("[data-visual]"), { clipPath: "inset(0% 0% 100% 0%)" })
      gsap.set(q("[data-body]"), { autoAlpha: 0, y: 12 })
      setScope(root, "live")

      const opening = gsap.timeline({ scrollTrigger: { trigger: q("[data-atmosphere]")[0], start: "top 82%", once: true } })
      opening
        .to(atmosphere, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: EASE.cinematic })
        .to(q("[data-atmosphere-img]"), { scale: 1, duration: 1.8, ease: "power2.out" }, 0)

      // Order of drops: nearest the trunk first, so the signal visibly
      // spreads outward from the centre.
      const byDistance = [...cards].sort(
        (a, b) => Math.abs(a.offsetLeft - trunkX) - Math.abs(b.offsetLeft - trunkX)
      )
      const drops = byDistance.map((c) => c.querySelector("[data-drop]"))
      const nodes = byDistance.map((c) => c.querySelector("[data-node]"))

      const build = gsap.timeline({ scrollTrigger: { trigger: diagram, start: "top 78%", once: true } })
      if (desktop) {
        build
          .to(q("[data-origin]"), { scale: 1, duration: 0.35, ease: "back.out(2.4)" })
          .to(q("[data-origin-label]"), { autoAlpha: 1, x: 0, duration: 0.4 }, "<0.1")
          .to(trunk, { scaleY: 1, duration: 0.5, ease: EASE.cinematic }, "<")
          .to([busL, busR], { scaleX: 1, duration: 0.7, ease: EASE.cinematic }, "-=0.1")
          .to(drops, { scaleY: 1, duration: 0.35, stagger: 0.08, ease: EASE.out }, "-=0.35")
      }
      // Below desktop the trunk and bus aren't drawn, so the cards resolve
      // straight from their nodes.
      build
        .to(nodes, { scale: 1, duration: 0.35, stagger: 0.08, ease: "back.out(2.4)" }, desktop ? "-=0.3" : 0)
        .to(
          byDistance.map((c) => c.querySelector("[data-visual]")),
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, stagger: 0.08, ease: EASE.cinematic },
          "-=0.45"
        )
        .to(
          byDistance.map((c) => c.querySelector("[data-body]")),
          { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 },
          "-=0.7"
        )

      // ---- signal on hover / focus ----
      const cleanups = [revealOnFocus(root, opening, build)]
      const interactive = desktop && hasFinePointer()
      let pulseTl = null

      const activate = (card) => {
        mark(card)
        gsap.to(card.querySelector("[data-node]"), { scale: 1.9, duration: 0.3, ease: "back.out(2)", overwrite: "auto" })

        if (!interactive) return
        const i = cards.indexOf(card)
        cards.forEach((c, j) => {
          if (c === card) return
          gsap.to(c.querySelector("[data-body]"), { x: j < i ? -6 : 6, duration: 0.45, overwrite: "auto" })
        })

        if (card.dataset.connected !== "true") return
        const dx = card.offsetLeft - trunkX
        gsap.set(glow, { x: trunkX, scaleX: 0 })
        gsap.to(glow, { scaleX: dx || 1, duration: 0.45, ease: EASE.cinematic, overwrite: "auto" })

        // Origin → down the trunk → along the bus → down the drop. The
        // pulse lives in the grid's coordinates, where the bus is y = 0.
        pulseTl?.kill()
        pulseTl = gsap
          .timeline()
          .set(pulse, { x: trunkX, y: -trunk.offsetHeight, autoAlpha: 1 })
          .to(pulse, { y: 0, duration: 0.18, ease: "none" })
          .to(pulse, { x: card.offsetLeft, duration: Math.min(0.4, Math.abs(dx) / 1400), ease: "none" })
          .to(pulse, { y: card.offsetTop, duration: 0.14, ease: "none" })
          .to(pulse, { autoAlpha: 0, duration: 0.15 })
      }

      const deactivate = (card) => {
        mark(null)
        gsap.to(card.querySelector("[data-node]"), { scale: 1, duration: 0.3, overwrite: "auto" })
        if (!interactive) return
        cards.forEach((c) => gsap.to(c.querySelector("[data-body]"), { x: 0, duration: 0.45, overwrite: "auto" }))
        gsap.to(glow, { scaleX: 0, duration: 0.3, ease: EASE.out, overwrite: "auto" })
      }

      cleanups.push(bind(activate, deactivate))

      return () => {
        ro?.disconnect()
        pulseTl?.kill()
        cleanups.forEach((fn) => fn())
        mark(null)
      }
    },
    [domainNodes.length]
  )

  return (
    <section ref={ref} className={styles.section} aria-label="Domains" data-motion-scope="pending">
      <SectionHeader
        index="02"
        label="ONE FOUNDATION — MULTIPLE APPLICATIONS"
        lines={["THE LINE BRANCHES"]}
        align="center"
      />

      <div className={styles.atmosphere} data-atmosphere data-reveal>
        <span className={styles.atmosphereInner} data-atmosphere-img>
          <MotionMedia
            media={media?.domains}
            fallbackSrc="/images/domains/one-foundation-four-domains.png"
            sizes="(min-width: 1180px) 1084px, 100vw"
            paper
            className={styles.atmosphereImg}
          />
        </span>
      </div>

      {domainNodes.length === 0 ? (
        <p className={styles.empty}>Career map — awaiting content.</p>
      ) : (
        <div className={styles.diagram} data-diagram>
          <div className={styles.origin} aria-hidden="true">
            <span className={styles.originNode} data-origin data-reveal />
            <span className={`label ${styles.originLabel}`} data-origin-label data-reveal>
              ORIGIN — {count} BRANCHES
            </span>
          </div>
          <span className={styles.trunk} data-trunk data-reveal aria-hidden="true" />

          <div className={styles.grid} data-grid>
            <span className={styles.bus} data-bus="left" data-reveal aria-hidden="true" />
            <span className={styles.bus} data-bus="right" data-reveal aria-hidden="true" />
            <span className={styles.glow} data-glow aria-hidden="true" />
            <span className={styles.pulse} data-pulse aria-hidden="true" />

            {domainNodes.map((node) => (
              // Opens the map with this domain preselected, which surfaces
              // the resume tagged for that path along with its work.
              <a
                key={node.id}
                href={`/map?node=${encodeURIComponent(node.slug)}`}
                className={styles.branch}
                data-branch
                data-state="idle"
                data-connected="false"
                data-cursor="node"
                data-cursor-label="RESUME & WORK"
              >
                <span className={styles.drop} data-drop data-reveal aria-hidden="true" />
                <span className={styles.node} data-node data-cursor-anchor data-reveal aria-hidden="true" />

                <span className={styles.body} data-body data-reveal>
                  <span className={styles.branchVisual} data-visual>
                    <MotionMedia
                      media={media?.[MEDIA_KEY_BY_SLUG[node.slug]]}
                      fallbackSrc={FALLBACK_IMAGE_BY_SLUG[node.slug] ?? "/images/domains/one-foundation-four-domains.png"}
                      sizes="(min-width: 961px) 25vw, (min-width: 641px) 50vw, 100vw"
                      className={styles.branchVisualImg}
                    />
                  </span>
                  <span className={`label ${styles.branchLabel}`}>{node.label}</span>
                  <span className={styles.summary}>
                    {node.description || SUMMARY_BY_SLUG[node.slug] || ""}
                  </span>
                  <span className={styles.cue}>RESUME &amp; WORK →</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

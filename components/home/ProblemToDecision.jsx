"use client"

import { useRef } from "react"
import MotionMedia from "../MotionMedia"
import SectionHeader from "../motion/SectionHeader"
import useMotion, { setScope } from "../../hooks/useMotion"
import { gsap, ScrollTrigger, EASE } from "../../lib/motion"
import { thinkingSteps } from "../../data/career"
import styles from "./ProblemToDecision.module.css"

// Where each step starts before the pattern forms: a loose scatter,
// fixed rather than random so the composition is identical every visit.
const SCATTER = [
  { x: -110, y: -90, r: -7 },
  { x: 60, y: 110, r: 5 },
  { x: -40, y: -140, r: 3 },
  { x: 90, y: 70, r: -5 },
  { x: 140, y: -60, r: 7 }
]

/**
 * A large transition moment. On desktop the section pins and the scroll
 * drives two phases: the loose steps reorganise into a single chain, then
 * a line runs through them, activating each in turn — problem to decision.
 * A giant outlined section numeral drifts behind at a slower rate.
 * Small screens get a vertical chain that activates as it passes centre.
 */
export default function ProblemToDecision({ media }) {
  const ref = useRef(null)
  const last = thinkingSteps.length - 1

  useMotion(
    ref,
    ({ reduce, desktop }) => {
      const root = ref.current
      const q = gsap.utils.selector(root)
      const steps = q("[data-step]")
      let shown = -2
      const setActive = (i) => {
        if (i === shown) return
        shown = i
        steps.forEach((s, j) => (s.dataset.state = j < i ? "done" : j === i ? "current" : "pending"))
      }

      if (reduce) {
        setActive(last)
        return setScope(root, "static")
      }
      setActive(-1)

      if (desktop) {
        gsap.set(q("[data-chain-line]"), { scaleX: 0 })
        gsap.set(q("[data-step-node]"), { scale: 0 })
        steps.forEach((s, i) => {
          const o = SCATTER[i % SCATTER.length]
          gsap.set(s, { x: o.x, y: o.y, rotation: o.r, autoAlpha: 0.25 })
        })
        setScope(root, "live")

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${window.innerHeight * 1.4}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true
          }
        })

        // Phase 1 — the pattern forms.
        tl.to(steps, { x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: 0.4, stagger: 0.05, ease: EASE.out }, 0)
          .to(q("[data-step-node]"), { scale: 1, duration: 0.1, stagger: 0.05, ease: "back.out(2)" }, 0.32)

        // Phase 2 — the line runs through it, activating each step.
        const line = { p: 0 }
        tl.to(q("[data-chain-line]"), { scaleX: 1, duration: 0.5 }, 0.5).to(
          line,
          {
            p: 1,
            duration: 0.5,
            onUpdate: () => setActive(line.p <= 0 ? -1 : Math.min(last, Math.round(line.p * last)))
          },
          0.5
        )
        // Hold the resolved state briefly before the pin releases.
        tl.to({}, { duration: 0.12 })

        gsap.fromTo(
          q("[data-numeral]"),
          { yPercent: 18 },
          {
            yPercent: -18,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: () => `+=${window.innerHeight * 3.4}`,
              scrub: true,
              invalidateOnRefresh: true
            }
          }
        )
        return
      }

      // Mobile: a vertical chain, drawn by scroll, stepped at centre.
      gsap.set(q("[data-chain-line]"), { scaleY: 0 })
      gsap.set(steps, { autoAlpha: 0, x: -12 })
      setScope(root, "live")

      gsap.to(q("[data-chain-line]"), {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: q("[data-chain]")[0], start: "top 70%", end: "bottom 50%", scrub: 0.5 }
      })
      steps.forEach((s, i) => {
        gsap.to(s, {
          autoAlpha: 1,
          x: 0,
          duration: 0.6,
          scrollTrigger: { trigger: s, start: "top 88%", once: true }
        })
        ScrollTrigger.create({
          trigger: s,
          start: "center 55%",
          onEnter: () => setActive(i),
          onLeaveBack: () => setActive(i - 1)
        })
      })
    },
    []
  )

  return (
    <section ref={ref} className={styles.section} aria-label="How I think" data-motion-scope="pending">
      <div className={styles.backdrop} aria-hidden="true">
        <MotionMedia
          media={media?.methodology}
          fallbackSrc="/images/methodology/ideas-models-impact.png"
          paper
          className={styles.backdropImg}
        />
      </div>

      <span className={styles.numeral} data-numeral aria-hidden="true">
        03
      </span>

      <div className={styles.inner}>
        <SectionHeader index="03" label="HOW I THINK" lines={["ONE WORKING PATTERN"]} align="center" />

        <div className={styles.chain} data-chain>
          <span className={styles.chainTrack} aria-hidden="true" />
          <span className={styles.chainLine} data-chain-line data-reveal aria-hidden="true" />
          <ol className={styles.steps}>
            {thinkingSteps.map((word, i) => (
              <li key={word} className={styles.step} data-step data-state="pending" data-reveal>
                <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.stepNode} data-step-node aria-hidden="true" />
                <span className={styles.word}>{word}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

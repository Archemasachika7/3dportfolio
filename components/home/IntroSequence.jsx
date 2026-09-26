"use client"

import { useRef } from "react"
import ScaleZoom from "../hero/ScaleZoom"
import Cta from "../motion/Cta"
import { fieldState } from "../CoordinateField"
import useMotion, { setScope } from "../../hooks/useMotion"
import { gsap, ScrollTrigger, SplitText, EASE, hasFinePointer, revealOnFocus } from "../../lib/motion"
import { identity } from "../../data/career"
import styles from "./IntroSequence.module.css"

/**
 * The title sequence. One GSAP timeline, seven phases:
 *
 *   01  blank field
 *   02  the coordinate system fades in — grid density rises, registration
 *       lines and crop marks draw
 *   03  technical metadata resolves in an engineering-drawing title block
 *   04  the name reveals through per-word masks, tightening its tracking as
 *       it settles
 *   05  a structural line travels the full viewport width, a node riding
 *       its leading edge
 *   06  subtitle and calls to action enter after the identity
 *   07  on scroll, the composition is physically displaced up and out,
 *       its layers separating in depth, while the grid accelerates then
 *       settles
 *
 * Intro, pointer and scroll motion live on separate wrapper layers so they
 * never write the same transform.
 */

function TitleBlock({ cells }) {
  if (cells.length === 0) return null
  return (
    <dl className={styles.titleBlock} data-titleblock>
      {cells.map((cell) => (
        <div key={cell.term} className={styles.cell} data-cell data-reveal>
          <dt className={styles.cellTerm}>{cell.term}</dt>
          <dd className={styles.cellValue}>
            <span className={styles.cellMask}>
              <span data-cell-value>{cell.value}</span>
            </span>
          </dd>
        </div>
      ))}
    </dl>
  )
}

// The greeting flickers through languages while the grid comes up, then
// settles on the line that introduces the name. The last entry stays.
const GREETINGS = ["Hello", "নমস্কার", "नमस्ते", "Bonjour", "Hola", "Ciao", "こんにちは", "Hello, I'm"]

/** Four L-shaped crop marks framing the sheet, like a print proof. */
function CropMarks() {
  return (
    <>
      {["tl", "tr", "bl", "br"].map((pos) => (
        <span key={pos} className={styles.crop} data-pos={pos} data-crop data-reveal aria-hidden="true" />
      ))}
    </>
  )
}

export default function IntroSequence({ profile, domains = [] }) {
  const ref = useRef(null)
  const zoomRef = useRef(null)

  const name = profile?.name || identity.name
  const words = name.trim().split(/\s+/)
  const descriptor = profile?.headline || identity.descriptor
  const portraitUrl = profile?.profile_image_url ?? null

  // Real data only: a cell with no value is omitted, never invented.
  const discipline = domains.map((d) => d.label).filter(Boolean).join(" · ")
  const cells = [
    { term: "Role", value: profile?.current_role_title },
    { term: "Discipline", value: discipline },
    { term: "Location", value: profile?.location },
    { term: "Status", value: profile?.availability_status || profile?.current_status }
  ].filter((c) => c.value)

  useMotion(
    ref,
    ({ reduce, desktop, mobile }) => {
      const root = ref.current
      const q = gsap.utils.selector(root)
      const trackWidth = () => q("[data-track]")[0]?.offsetWidth ?? 0
      const label = q("[data-track-label]")[0]
      if (label) label.textContent = `L = ${trackWidth()} PX`

      if (reduce) {
        // A still composition at full strength. The grid still eases back to
        // its resting weight as the hero leaves — an opacity change, no
        // movement — so the rest of the page isn't left at hero density.
        setScope(root, "static")
        fieldState.boost = 1
        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "bottom top",
          onUpdate: (self) => (fieldState.exit = self.progress)
        })
        return () => {
          fieldState.boost = 0
          fieldState.exit = 0
        }
      }

      const descSplit = SplitText.create(q("[data-descriptor]"), {
        type: "words",
        mask: "words",
        wordsClass: "split-word"
      })

      // ---------- initial states (applied before first paint) ----------
      gsap.set(q("[data-spine]"), { scaleY: 0 })
      gsap.set(q("[data-crop]"), { scale: 0 })
      gsap.set(q("[data-annot]"), { autoAlpha: 0, y: -8 })
      gsap.set(q("[data-title-rule]"), { scaleX: 0 })
      gsap.set(q("[data-cell]"), { autoAlpha: 1 })
      gsap.set(q("[data-cell] dt"), { autoAlpha: 0 })
      gsap.set(q("[data-cell-value]"), { yPercent: 110 })
      gsap.set(q("[data-visual]"), { autoAlpha: 0, scale: 1.04 })
      gsap.set(q("[data-greeting]"), { autoAlpha: 1 })
      gsap.set(q("[data-greeting-node]"), { scale: 0 })
      gsap.set(q("[data-greeting-word]"), { yPercent: 110 })
      gsap.set(q("[data-word]"), {
        yPercent: 112,
        x: mobile ? 16 : 44,
        letterSpacing: "0.05em"
      })
      gsap.set(q("[data-name]"), { autoAlpha: 1 })
      gsap.set(q("[data-portrait]"), { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" })
      gsap.set(q("[data-track-line]"), { scaleX: 0 })
      gsap.set(q("[data-track-node]"), { x: 0, scale: 0 })
      gsap.set(q("[data-track-end]"), { autoAlpha: 0 })
      gsap.set(descSplit.words, { yPercent: 110 })
      gsap.set(q("[data-descriptor]"), { autoAlpha: 1 })
      gsap.set(q("[data-cta]"), { opacity: 0, y: 14 }) // opacity: stays tabbable
      gsap.set(q("[data-cue]"), { autoAlpha: 0 })
      fieldState.boost = 0
      setScope(root, "live")

      // The node comes to rest on the far dimension tick, not off the sheet.
      const nodeRest = () => q("[data-side='end']")[0]?.offsetLeft ?? trackWidth()
      const T = mobile ? 0.75 : 1 // compress the whole sequence on small screens

      const intro = gsap.timeline({ defaults: { ease: EASE.out } })

      // 02 — the coordinate system
      intro
        .to(fieldState, { boost: 1, duration: 1.3 * T, ease: "power2.inOut" }, 0.25)
        .to(q("[data-spine]"), { scaleY: 1, duration: 1.1 * T, ease: EASE.cinematic }, 0.35)
        .to(q("[data-crop]"), { scale: 1, duration: 0.5, stagger: 0.07, ease: "back.out(2)" }, 0.5)
        .to(q("[data-annot]"), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.7)

      // 01 → 02 — hello, in a few languages, while the field comes up
      const greetWord = q("[data-greeting-word]")[0]
      const G = mobile ? 0.11 : 0.13
      intro.to(q("[data-greeting-node]"), { scale: 1, duration: 0.3, ease: "back.out(2.4)" }, 0.2)
      GREETINGS.forEach((word, i) => {
        const at = 0.3 + i * G * T
        intro
          .call(() => greetWord && (greetWord.textContent = word), null, at)
          .fromTo(
            greetWord,
            { yPercent: 110 },
            { yPercent: 0, duration: i === GREETINGS.length - 1 ? 0.6 : 0.1, ease: EASE.out, immediateRender: false },
            at
          )
      })

      // The drawing begins to draw itself as the sheet assembles.
      intro.call(() => zoomRef.current?.start(), null, 0.9 * T)

      // 03 — the title block
      intro
        .to(q("[data-title-rule]"), { scaleX: 1, duration: 0.9 * T, ease: EASE.cinematic }, 0.85)
        .to(q("[data-cell] dt"), { autoAlpha: 1, duration: 0.4, stagger: 0.08 }, 1.0)
        .to(q("[data-cell-value]"), { yPercent: 0, duration: 0.8, stagger: 0.08 }, 1.08)

      // 04 — the identity
        .to(q("[data-visual]"), { autoAlpha: 1, scale: 1, duration: 1.4, ease: "power2.out" }, 0.9 * T)
        .to(
          q("[data-word]"),
          {
            yPercent: 0,
            x: 0,
            letterSpacing: "-0.035em",
            duration: 1.35 * T,
            stagger: 0.12,
            ease: EASE.cinematic
          },
          1.25 * T
        )
        .to(
          q("[data-portrait]"),
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.0, ease: EASE.cinematic },
          1.35 * T
        )

      // 05 — the structural line crosses the sheet
        .to(q("[data-track-node]"), { scale: 1, duration: 0.25, ease: "back.out(2.5)" }, 2.1 * T)
        .to(q("[data-track-line]"), { scaleX: 1, duration: 1.15 * T, ease: EASE.cinematic }, 2.15 * T)
        .to(
          q("[data-track-node]"),
          { x: nodeRest, duration: 1.15 * T, ease: EASE.cinematic },
          2.15 * T
        )
        .to(q("[data-track-end]"), { autoAlpha: 1, duration: 0.4, stagger: 0.06 }, 3.05 * T)

      // 06 — subtitle, then the calls to action
        .to(descSplit.words, { yPercent: 0, duration: 0.8, stagger: 0.035 }, 2.7 * T)
        .to(q("[data-cta]"), { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 2.95 * T)
        .to(q("[data-cue]"), { autoAlpha: 1, duration: 0.8 }, 3.3 * T)

      const unfocus = revealOnFocus(root, intro)

      // 07 — physical displacement out of frame, scrubbed to scroll
      const exit = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.7 }
      })
      exit
        .to(q("[data-layer='identity']"), {
          y: () => -window.innerHeight * (desktop ? 0.24 : 0.12),
          scale: desktop ? 0.94 : 1,
          autoAlpha: 0.12
        }, 0)
        .to(q("[data-layer='block']"), {
          y: () => -window.innerHeight * (desktop ? 0.1 : 0.05),
          autoAlpha: 0
        }, 0)
        .to(q("[data-layer='visual']"), {
          y: () => window.innerHeight * (desktop ? 0.14 : 0.06),
          autoAlpha: desktop ? 0.4 : 0.1
        }, 0)
        .to(q("[data-layer='frame']"), { autoAlpha: 0 }, 0.1)
        .to(fieldState, { exit: 1, immediateRender: false }, 0)

      if (desktop) {
        // The two annotations part like the sheet is being pulled apart.
        exit
          .to(q("[data-annot='left']"), { x: -72, autoAlpha: 0 }, 0)
          .to(q("[data-annot='right']"), { x: 72, autoAlpha: 0 }, 0)
          // Grid accelerates mid-exit, then settles back to its resting drift.
          .to(fieldState, { keyframes: { drift: [1, 3.6, 1] }, immediateRender: false }, 0)
      }

      // Micro-parallax: the name and the visual lean in opposite directions
      // under the pointer, giving the sheet a sense of depth.
      if (desktop && hasFinePointer()) {
        const nameX = gsap.quickTo(q("[data-name]"), "x", { duration: 1.1 })
        const nameY = gsap.quickTo(q("[data-name]"), "y", { duration: 1.1 })
        const visX = gsap.quickTo(q("[data-visual]"), "x", { duration: 1.4 })
        const visY = gsap.quickTo(q("[data-visual]"), "y", { duration: 1.4 })
        const onMove = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5
          const ny = e.clientY / window.innerHeight - 0.5
          nameX(nx * 14)
          nameY(ny * 8)
          visX(nx * -22)
          visY(ny * -14)
        }
        root.addEventListener("pointermove", onMove)
        return () => {
          unfocus()
          root.removeEventListener("pointermove", onMove)
          fieldState.boost = 0
          fieldState.exit = 0
          fieldState.drift = 1
        }
      }

      return () => {
        unfocus()
        fieldState.boost = 0
        fieldState.exit = 0
        fieldState.drift = 1
      }
    },
    [name, descriptor, portraitUrl, cells.length]
  )

  return (
    <section ref={ref} className={styles.hero} aria-label="Introduction" data-motion-scope="pending">
      <div className={styles.visualLayer} data-layer="visual" aria-hidden="true">
        <div className={styles.visual} data-visual data-reveal>
          <ScaleZoom
            ref={zoomRef}
            autoStart={false}
            svgClassName={styles.visualImg}
            readoutClassName={styles.readout}
          />
        </div>
      </div>

      <div className={styles.frame} data-layer="frame" aria-hidden="true">
        <span className={styles.spine} data-spine data-reveal />
        <CropMarks />
      </div>

      <span className={`label ${styles.systemTag}`} data-annot="left" data-reveal>
        {identity.systemTag}
      </span>
      <span className={`label ${styles.fileTag}`} data-annot="right" data-reveal>
        {identity.fileTag}
      </span>

      <div className={styles.identity} data-layer="identity">
        {portraitUrl && (
          <div className={styles.portrait} data-portrait data-reveal>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL */}
            <img src={portraitUrl} alt={name} className={styles.portraitImg} />
            <span className={styles.portraitTick} aria-hidden="true" />
          </div>
        )}

        <p className={styles.greeting} data-greeting data-reveal>
          <span className={styles.greetingNode} data-greeting-node aria-hidden="true" />
          <span className={styles.greetingMask}>
            <span className={styles.greetingWord} data-greeting-word>
              {GREETINGS[GREETINGS.length - 1]}
            </span>
          </span>
        </p>

        <h1 className={styles.name} data-name data-reveal aria-label={name}>
          {words.map((word, i) => (
            <span key={i} className={styles.wordMask} aria-hidden="true">
              <span className={styles.word} data-word>
                {word}
              </span>
            </span>
          ))}
        </h1>

        <div className={styles.track} data-track aria-hidden="true">
          <span className={styles.trackLine} data-track-line data-reveal />
          <span className={styles.trackNode} data-track-node data-reveal />
          <span className={styles.trackTick} data-track-end data-side="start" data-reveal />
          <span className={styles.trackTick} data-track-end data-side="end" data-reveal />
          {/* Filled in at runtime: the line reports its own measured length. */}
          <span className={styles.trackLabel} data-track-end data-track-label data-reveal />
        </div>

        <div className={styles.lower}>
          <p className={`label ${styles.descriptor}`} data-descriptor data-reveal>
            {descriptor}
          </p>
          <div className={styles.ctas}>
            <span data-cta data-reveal>
              <Cta href="#work">Selected work ↓</Cta>
            </span>
            <span data-cta data-reveal>
              <Cta href="/resume" variant="ghost">
                Resume →
              </Cta>
            </span>
          </div>
        </div>
      </div>

      <div className={styles.block} data-layer="block">
        <span className={styles.titleRule} data-title-rule data-reveal aria-hidden="true" />
        <TitleBlock cells={cells} />
        <div className={styles.cue} data-cue data-reveal>
          <span className="label">Scroll</span>
          <span className={styles.cueLine} />
        </div>
      </div>
    </section>
  )
}

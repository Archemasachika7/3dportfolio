/**
 * The site's motion system in one place.
 *
 * GSAP owns all choreography — timelines, anything tied to scroll
 * position, pointer-reactive motion. CSS transitions handle simple state
 * changes (hover, active), keyed to the same tokens. Components build their
 * motion through hooks/useMotion, which scopes it to a gsap.matchMedia so
 * reduced-motion and breakpoint changes rebuild cleanly.
 *
 * Easing and duration mirror the CSS tokens in app/globals.css, so a CSS
 * transition and a GSAP tween on the same page move with the same curve.
 *
 * One exception: Motion (motion/react) drives animation that follows React
 * state rather than time or scroll — a selection indicator sliding between
 * buttons, content swapping in and out — where it measures layout and
 * handles unmounting for us (see components/map/MapExplorer).
 */
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { CustomEase } from "gsap/CustomEase"

let registered = false

export function registerMotion() {
  if (registered || typeof window === "undefined") return
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)
  // Exact matches for --ease-out and --ease-cinematic.
  CustomEase.create("site.out", "0.16,1,0.3,1")
  CustomEase.create("site.cinematic", "0.65,0,0.08,1")
  // Interface curves, matching --ease-out-quart and --ease-in-out-cubic:
  // for things the visitor triggers (hover, focus), and for small marks
  // that pin into place without overshooting.
  CustomEase.create("ui.out", "0.165,0.84,0.44,1")
  CustomEase.create("ui.inOut", "0.645,0.045,0.355,1")
  gsap.defaults({ ease: "site.out", duration: 0.6 })
  // Sections render optional parts from CMS data (a portrait, a video), so
  // an empty selection is expected, not an error.
  gsap.config({ nullTargetWarn: false })
  registered = true
}

export const EASE = {
  out: "site.out",
  cinematic: "site.cinematic",
  uiOut: "ui.out",
  uiInOut: "ui.inOut",
  linear: "none"
}

// Seconds. Mirrors --t-micro … --t-hero.
export const DUR = {
  micro: 0.16,
  small: 0.3,
  medium: 0.6,
  large: 1.0,
  hero: 1.4
}

export const MQ = {
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 961px)",
  mobile: "(max-width: 960px)",
  finePointer: "(pointer: fine)"
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(MQ.reduce).matches
}

export function hasFinePointer() {
  return typeof window !== "undefined" && window.matchMedia(MQ.finePointer).matches
}

/**
 * Line-masked text reveal that survives re-wrapping. The split re-runs when
 * web fonts finish loading or the element resizes (autoSplit), and SplitText
 * carries the reveal's progress onto the new lines — so there's never a jump
 * between the animated lines and the final text flow. Call `play()` from a
 * timeline (tl.call) to start it.
 */
export function splitLines(target, vars = {}) {
  let tween = null
  let started = false
  const split = SplitText.create(target, {
    type: "lines",
    mask: "lines",
    linesClass: "split-line",
    autoSplit: true,
    onSplit(self) {
      tween = gsap.fromTo(
        self.lines,
        { yPercent: 110 },
        { yPercent: 0, duration: 1, stagger: 0.08, ease: EASE.out, ...vars, paused: !started }
      )
      return tween
    }
  })
  return {
    split,
    play: () => {
      started = true
      tween?.play()
    }
  }
}

/**
 * Keyboard users must never land on content still waiting for its reveal.
 * When focus enters `root`, any unfinished timeline jumps to its end state
 * (callbacks fire, so chained reveals start too). Returns a cleanup.
 *
 * Pair it with opacity — not autoAlpha — on focusable elements: autoAlpha
 * sets visibility:hidden, which removes them from the tab order entirely.
 */
export function revealOnFocus(root, ...timelines) {
  const finish = () => timelines.forEach((tl) => tl && tl.progress() < 1 && tl.progress(1))
  root.addEventListener("focusin", finish)
  return () => root.removeEventListener("focusin", finish)
}

export { gsap, ScrollTrigger, SplitText }

"use client"

import { useEffect, useLayoutEffect } from "react"
import { gsap, registerMotion, MQ } from "../lib/motion"

// Layout effect on the client so initial states are applied before paint;
// plain effect on the server, where layout effects only emit a warning.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

/**
 * Builds a component's motion inside a scoped gsap.matchMedia().
 *
 * `build` receives `{ reduce, desktop, mobile }` and re-runs automatically —
 * after a full revert — whenever one of those media conditions changes, so
 * rotating a tablet or toggling reduced motion never leaves stale tweens,
 * ScrollTriggers or split text behind. Everything created inside is reverted
 * before React unmounts the DOM it touched.
 *
 * The root element should render `data-motion-scope="pending"`; builders
 * flip it to "live" once they have applied their initial states, which is
 * what lifts the CSS pre-paint gate (see globals.css).
 */
export default function useMotion(scopeRef, build, deps = []) {
  useIsoLayoutEffect(() => {
    if (!scopeRef.current) return
    registerMotion()
    const mm = gsap.matchMedia(scopeRef)
    mm.add(
      { reduce: MQ.reduce, desktop: MQ.desktop, mobile: MQ.mobile },
      (context) => build(context.conditions, context)
    )
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Marks a scope as handed over to JS (or intentionally static). */
export function setScope(el, state) {
  if (el) el.dataset.motionScope = state
}

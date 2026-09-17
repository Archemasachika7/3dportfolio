"use client"

import { useEffect, useState } from "react"

/**
 * Tracks the `prefers-reduced-motion` media query.
 * Defaults to `false` on the server / first paint so GSAP timelines and
 * ScrollTriggers can decide up front whether to build the full sequence
 * or jump straight to the resting state.
 */
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(query.matches)

    const handleChange = (event) => setReduced(event.matches)
    query.addEventListener("change", handleChange)
    return () => query.removeEventListener("change", handleChange)
  }, [])

  return reduced
}

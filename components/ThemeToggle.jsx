"use client"

import { useEffect, useState } from "react"
import { getTheme, setTheme, onThemeChange } from "../lib/theme"
import { prefersReducedMotion } from "../lib/motion"
import styles from "./ThemeToggle.module.css"

/**
 * Light / dark switch for the nav. Drawn like a small slide switch on a
 * drawing sheet; the visible state comes from CSS on <html data-theme>, so
 * the server render is correct for either theme with no hydration flicker.
 *
 * Switching lays the new theme over the old one like a fresh sheet wiped
 * in from the top (View Transitions). Unsupported browsers and
 * reduced-motion visitors switch instantly.
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(getTheme() === "dark")
    return onThemeChange((t) => setDark(t === "dark"))
  }, [])

  const toggle = () => {
    const next = getTheme() === "dark" ? "light" : "dark"
    if (!document.startViewTransition || prefersReducedMotion()) {
      setTheme(next)
      return
    }
    const transition = document.startViewTransition(() => setTheme(next))
    transition.ready
      .then(() =>
        document.documentElement.animate(
          { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"] },
          {
            duration: 700,
            easing: "cubic-bezier(0.65, 0, 0.08, 1)",
            pseudoElement: "::view-transition-new(root)"
          }
        )
      )
      .catch(() => {})
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label="Dark theme"
      aria-pressed={dark}
      data-cursor="interactive"
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob} />
      </span>
      <span className={styles.label} aria-hidden="true">
        <span className={styles.light}>LIGHT</span>
        <span className={styles.dark}>DARK</span>
      </span>
    </button>
  )
}

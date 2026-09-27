"use client"

import { useEffect, useRef } from "react"

// Items that enter together are staggered by this much.
const STAGGER_MS = 80

/**
 * Scroll entrance for content below an inner page's intro: each
 * [data-reveal] descendant rises into place (or, for data-reveal="wipe",
 * unmasks top to bottom) as it enters the viewport. The motion itself is
 * CSS (app/globals.css, SCROLL REVEAL); this only watches the viewport and
 * marks items as shown, so the page carries no animation library for it.
 *
 * Starts in the site's pre-paint gate (data-motion-scope="pending"), so
 * nothing flashes before it's hidden. Reduced-motion visitors, and anyone
 * whose scripts fail, get the content as-is. Keyboard focus entering the
 * block shows everything, so focus never lands on something invisible.
 */
export default function Reveal({ as: Tag = "div", className, children, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = Array.from(root.querySelectorAll("[data-reveal]"))
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce || !items.length || !("IntersectionObserver" in window)) {
      root.dataset.motionScope = "static"
      return
    }

    const show = (el, i = 0) => {
      el.style.setProperty("--reveal-delay", `${i * STAGGER_MS}ms`)
      el.dataset.shown = "true"
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
          .forEach((e, i) => {
            show(e.target, i)
            io.unobserve(e.target)
          })
      },
      { rootMargin: "0px 0px -8% 0px" }
    )
    items.forEach((el) => io.observe(el))
    root.dataset.motionScope = "live"

    const showAll = () => {
      io.disconnect()
      items.forEach((el) => show(el))
    }
    root.addEventListener("focusin", showAll, { once: true })
    return () => {
      io.disconnect()
      root.removeEventListener("focusin", showAll)
    }
  }, [])

  return (
    <Tag ref={ref} className={className} data-motion-scope="pending" data-reveal-scope {...rest}>
      {children}
    </Tag>
  )
}

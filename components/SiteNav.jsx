"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import styles from "./SiteNav.module.css"

const NAV_LINKS = [
  { href: "/work", label: "WORK" },
  { href: "/map", label: "MAP" },
  { href: "/resume", label: "RESUME" },
  { href: "/about", label: "ABOUT" }
]

const HOME_SECTIONS = [
  { label: "Introduction", indicator: "00 / SYSTEM" },
  { label: "Education", indicator: "01 / FOUNDATION" },
  { label: "Domains", indicator: "02 / MAP" },
  { label: "How I think", indicator: "03 / METHOD" },
  { label: "Featured projects", indicator: "04 / WORK" },
  { label: "Closing", indicator: "05 / END" }
]

function SectionIndicator() {
  const [indicator, setIndicator] = useState(HOME_SECTIONS[0].indicator)

  useEffect(() => {
    const sections = HOME_SECTIONS.map((s) =>
      document.querySelector(`[aria-label="${s.label}"]`)
    ).filter(Boolean)
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const match = HOME_SECTIONS.find(
          (s) => document.querySelector(`[aria-label="${s.label}"]`) === visible.target
        )
        if (match) setIndicator(match.indicator)
      },
      { threshold: [0.2, 0.5, 0.8], rootMargin: "-45% 0px -45% 0px" }
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return <span className={`label ${styles.status}`}>{indicator}</span>
}

export default function SiteNav() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  return (
    <header className={styles.nav}>
      <a href="/" className={styles.mark} data-cursor="interactive">
        ARCHISHMAN DAS
      </a>

      <nav className={styles.links}>
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            data-cursor="interactive"
            data-active={pathname.startsWith(link.href) ? "true" : "false"}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {isHome ? <SectionIndicator /> : <span className={`label ${styles.status}`}>SYSTEM / ONLINE</span>}
    </header>
  )
}

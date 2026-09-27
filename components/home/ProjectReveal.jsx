"use client"

import { useRef } from "react"
import useMotion, { setScope } from "../../hooks/useMotion"
import { gsap, splitLines, EASE, hasFinePointer, revealOnFocus } from "../../lib/motion"
import styles from "./ProjectReveal.module.css"

const CORNERS = ["tl", "tr", "bl", "br"]
// Mask the media opens from: a centred window, like a detail callout.
const INSET = { x: 0.3, y: 0.14 }

/**
 * One case study, revealed as a sequence: its number rolls in, a dimension
 * line measures out the entry, metadata and title resolve, then the media
 * opens from a centred window — registration marks riding the mask's
 * corners — while the image settles from overscale. Info and a technical
 * rule close the entry.
 *
 * Desktop adds scroll parallax inside the frame and a pointer-responsive
 * hover (small lean, 1.03 scale, drift toward the pointer, metadata shift).
 * Each motion owns its own wrapper, so none of them write the same transform.
 */
export default function ProjectReveal({ project, index, total }) {
  const ref = useRef(null)
  const nn = String(index + 1).padStart(2, "0")
  const tt = String(total ?? index + 1).padStart(2, "0")
  const primaryReport = project.reports?.[0]
  const domainTag = project.tags?.[0]
  const href = `/work/${project.slug}`
  const titleId = `project-${project.id}-title`

  useMotion(
    ref,
    ({ reduce, desktop, mobile }) => {
      const root = ref.current
      if (reduce) return setScope(root, "static")

      const q = gsap.utils.selector(root)
      const figure = q("[data-figure]")[0]
      // Split inside the link, not the heading: splitting the heading would
      // clone the <a> onto every line and add a tab stop per line.
      const title = splitLines(q("[data-title] a"))

      // Corner marks start where the mask's window starts.
      const cornerFrom = (pos) => () => ({
        x: (pos[1] === "l" ? 1 : -1) * figure.offsetWidth * INSET.x,
        y: (pos[0] === "t" ? 1 : -1) * figure.offsetHeight * INSET.y
      })
      const inset = `inset(${INSET.y * 100}% ${INSET.x * 100}% ${INSET.y * 100}% ${INSET.x * 100}%)`

      gsap.set(q("[data-number] > span"), { yPercent: 105 })
      gsap.set(q("[data-number]"), { autoAlpha: 1 })
      gsap.set(q("[data-dim-line]"), { scaleX: 0 })
      gsap.set(q("[data-dim-fade]"), { autoAlpha: 0 })
      gsap.set(q("[data-meta-item]"), { autoAlpha: 0, y: 8 })
      gsap.set(q("[data-title]"), { autoAlpha: 1 })
      gsap.set(q("[data-frame]"), { clipPath: inset, autoAlpha: 1 })
      gsap.set(q("[data-media-scale]"), { scale: 1.35 })
      CORNERS.forEach((pos) => gsap.set(q(`[data-corner='${pos}']`), { ...cornerFrom(pos)(), autoAlpha: 1 }))
      gsap.set(q("[data-info-item]"), { opacity: 0, y: 10 }) // opacity: links stay tabbable
      gsap.set(q("[data-tech-line]"), { scaleX: 0 })
      gsap.set(q("[data-tech-fade]"), { autoAlpha: 0 })
      setScope(root, "live")

      const s = mobile ? 0.8 : 1
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: mobile ? "top 85%" : "top 72%", once: true }
      })

      tl.to(q("[data-number] > span"), { yPercent: 0, duration: 0.7, stagger: 0.06 }, 0)
        .to(q("[data-dim-line]"), { scaleX: 1, duration: 0.9 * s, ease: EASE.cinematic }, 0.1)
        .to(q("[data-dim-fade]"), { autoAlpha: 1, duration: 0.4, stagger: 0.05 }, 0.5 * s)
        .to(q("[data-meta-item]"), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 }, 0.35 * s)
        .call(title.play, null, 0.4 * s)
        .to(q("[data-frame]"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3 * s, ease: EASE.cinematic }, 0.6 * s)
        .to(q("[data-corner]"), { x: 0, y: 0, duration: 1.3 * s, ease: EASE.cinematic }, 0.6 * s)
        .to(q("[data-media-scale]"), { scale: 1, duration: 1.9 * s, ease: "power3.out" }, 0.6 * s)
        .to(q("[data-info-item]"), { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 }, 1.25 * s)
        .to(q("[data-tech-line]"), { scaleX: 1, duration: 0.8, ease: EASE.cinematic }, 1.35 * s)
        .to(q("[data-tech-fade]"), { autoAlpha: 1, duration: 0.4, stagger: 0.05 }, 1.6 * s)

      const unfocus = revealOnFocus(root, tl)
      if (!desktop) return unfocus

      // Parallax inside the frame (the image layer is oversized to allow it).
      gsap.fromTo(
        q("[data-parallax]"),
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: "none",
          scrollTrigger: { trigger: figure, start: "top bottom", end: "bottom top", scrub: true }
        }
      )

      if (!hasFinePointer()) return unfocus

      // Pointer-responsive hover: lean ≤ 1.5°, drift ≤ 10px, scale 1.03.
      const rx = gsap.quickTo(figure, "rotationX", { duration: 0.6 })
      const ry = gsap.quickTo(figure, "rotationY", { duration: 0.6 })
      const hx = gsap.quickTo(q("[data-hover]"), "x", { duration: 0.8 })
      const hy = gsap.quickTo(q("[data-hover]"), "y", { duration: 0.8 })
      gsap.set(figure, { transformPerspective: 1400 })

      let rect = null
      const enter = () => {
        rect = figure.getBoundingClientRect()
        root.dataset.hover = "true"
        gsap.to(q("[data-hover]"), { scale: 1.03, duration: 0.5, ease: EASE.uiOut, overwrite: "auto" })
      }
      const move = (e) => {
        if (!rect) return
        const nx = (e.clientX - rect.left) / rect.width - 0.5
        const ny = (e.clientY - rect.top) / rect.height - 0.5
        ry(nx * 3)
        rx(ny * -3)
        hx(nx * 20)
        hy(ny * 20)
      }
      const leave = () => {
        rect = null
        root.dataset.hover = "false"
        rx(0)
        ry(0)
        hx(0)
        hy(0)
        gsap.to(q("[data-hover]"), { scale: 1, duration: 0.35, ease: EASE.uiOut, overwrite: "auto" })
      }
      figure.addEventListener("pointerenter", enter)
      figure.addEventListener("pointermove", move)
      figure.addEventListener("pointerleave", leave)
      return () => {
        unfocus()
        figure.removeEventListener("pointerenter", enter)
        figure.removeEventListener("pointermove", move)
        figure.removeEventListener("pointerleave", leave)
      }
    },
    [project.id, project.title]
  )

  return (
    <article
      ref={ref}
      className={styles.project}
      aria-labelledby={titleId}
      data-project
      data-hover="false"
      data-motion-scope="pending"
    >
      <div className={styles.head}>
        <span className={styles.number} data-number data-reveal aria-hidden="true">
          {nn.split("").map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </span>

        <div className={styles.dimension} aria-hidden="true">
          <span className={styles.dimLine} data-dim-line data-reveal />
          <span className={styles.dimTick} data-side="start" data-dim-fade data-reveal />
          <span className={styles.dimTick} data-side="end" data-dim-fade data-reveal />
          <span className={styles.dimLabel} data-dim-fade data-reveal>
            CASE {nn} / {tt}
          </span>
        </div>

        <div className={styles.meta}>
          {domainTag && (
            <span className="label" data-meta-item data-reveal>
              {domainTag.name.toUpperCase()}
            </span>
          )}
          {project.role && (
            <span className="label" data-meta-item data-reveal>
              {project.role}
            </span>
          )}
          {project.year && (
            <span className="label" data-meta-item data-reveal>
              {project.year}
            </span>
          )}
        </div>
      </div>

      <h3 className={styles.title} id={titleId} data-title data-reveal>
        <a href={href} className={styles.titleLink} data-cursor="project" data-cursor-label="VIEW CASE">
          {project.title}
        </a>
      </h3>

      <div className={styles.figure} data-figure>
        {/* Redundant with the title link, so kept out of the tab order. */}
        <a
          href={href}
          className={styles.frame}
          data-frame
          data-reveal
          data-cursor="project"
          data-cursor-label="VIEW CASE"
          tabIndex={-1}
          aria-hidden="true"
        >
          <span className={styles.parallax} data-parallax>
            <span className={styles.hoverLayer} data-hover>
              <span className={styles.mediaScale} data-media-scale>
                {project.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL
                  <img src={project.thumbnail_url} alt="" className={styles.img} loading="lazy" decoding="async" />
                ) : (
                  <span className={`bg-grid ${styles.gridFallback}`} />
                )}
              </span>
            </span>
          </span>
        </a>
        {CORNERS.map((pos) => (
          <span key={pos} className={styles.corner} data-pos={pos} data-corner data-reveal aria-hidden="true" />
        ))}
      </div>

      <div className={styles.tech} aria-hidden="true">
        <span className={styles.techLabel} data-tech-fade data-reveal>
          FIG. {nn}
        </span>
        <span className={styles.techLine} data-tech-line data-reveal />
        <span className={styles.techLabel} data-tech-fade data-reveal>
          {(project.tags?.length ?? 0).toString().padStart(2, "0")} TAGS
        </span>
      </div>

      <div className={styles.info}>
        {project.short_bio && (
          <p className={styles.summary} data-info-item data-reveal>
            {project.short_bio}
          </p>
        )}

        <div className={styles.side}>
          {project.tags?.length > 0 && (
            <ul className={styles.tags} data-info-item data-reveal>
              {project.tags.map((tag) => (
                <li key={tag.id} className={`label ${styles.tag}`}>
                  {tag.name}
                </li>
              ))}
            </ul>
          )}

          <div className={styles.actions} data-info-item data-reveal>
            <a href={href} className={`link-draw ${styles.actionLink}`} data-cursor="interactive">
              CASE STUDY →
            </a>
            {primaryReport?.file_url && (
              <a
                href={primaryReport.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`link-draw ${styles.actionLink}`}
                data-cursor="interactive"
              >
                VIEW PDF
              </a>
            )}
            {project.project_url && (
              <a
                href={project.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`link-draw ${styles.actionLink}`}
                data-cursor="interactive"
              >
                VISIT PROJECT ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

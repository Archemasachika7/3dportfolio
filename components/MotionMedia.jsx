"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import useReducedMotion from "../hooks/useReducedMotion"
import styles from "./MotionMedia.module.css"

/**
 * Renders a homepage_media row (video-with-poster, or a Supabase-hosted
 * image) when one is available and motion is allowed, and always falls
 * back to a local /public image otherwise — no Supabase row yet, the
 * row is an image not a video, prefers-reduced-motion is on, or
 * Supabase itself is unreachable. The fallback is never a loading
 * spinner or blank box; it's a real static image the site already
 * ships with.
 *
 * Fills its positioned parent (mirrors next/image's `fill` behaviour) —
 * the parent must be position:relative/absolute with a defined size.
 */
export default function MotionMedia({
  media,
  fallbackSrc,
  alt = "",
  loop = true,
  className = "",
  priority = false
}) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [inView, setInView] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (inView && !reduced) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [inView, reduced])

  const canPlayVideo = !reduced && media?.media_type === "video" && media?.storage_url
  const remoteImageUrl =
    !canPlayVideo && media?.media_type === "image" && media?.storage_url
      ? media.storage_url
      : null

  return (
    <div ref={containerRef} className={styles.wrap}>
      {canPlayVideo ? (
        <video
          ref={videoRef}
          className={`${styles.media} ${className}`}
          src={media.storage_url}
          poster={media.poster_url || undefined}
          muted
          loop={loop}
          playsInline
          preload="none"
          aria-hidden="true"
        />
      ) : remoteImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URL, no next/image domain config to lean on
        <img
          className={`${styles.media} ${className}`}
          src={remoteImageUrl}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        <Image
          src={fallbackSrc}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="100vw"
          className={`${styles.media} ${className}`}
        />
      )}
    </div>
  )
}

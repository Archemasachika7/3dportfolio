"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./PdfViewer.module.css"

const WORKER_SRC = "/pdfjs/pdf.worker.min.mjs"

/** Supabase serves a public object as a download when ?download= is set. */
function downloadUrl(url, fileName) {
  const sep = url.includes("?") ? "&" : "?"
  return `${url}${sep}download=${encodeURIComponent(fileName || "resume.pdf")}`
}

/**
 * Renders a PDF page by page with PDF.js, so it displays the same on phones
 * (where an <iframe> shows nothing or only the first page) as on desktop.
 * Pages draw as they scroll into view and redraw sharp on resize.
 */
export default function PdfViewer({ url, title, fileName, isPdf = true }) {
  const wrapRef = useRef(null)
  const [doc, setDoc] = useState(null)
  const [status, setStatus] = useState("loading")
  const [ratio, setRatio] = useState(1.414) // A4 until the first page says otherwise
  const [width, setWidth] = useState(0)

  // Load the document.
  useEffect(() => {
    let cancelled = false
    let loaded = null
    setDoc(null)
    // A Word version can't be drawn in the browser; offer the download.
    if (!isPdf) {
      setStatus("other")
      return
    }
    setStatus("loading")
    ;(async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
        pdfjs.GlobalWorkerOptions.workerSrc = WORKER_SRC
        loaded = await pdfjs.getDocument({ url, isEvalSupported: false }).promise
        if (cancelled) return loaded.destroy()
        const first = await loaded.getPage(1)
        const vp = first.getViewport({ scale: 1 })
        if (cancelled) return loaded.destroy()
        setRatio(vp.height / vp.width)
        setDoc(loaded)
        setStatus("ready")
      } catch (e) {
        console.error("PdfViewer", e)
        if (!cancelled) setStatus("error")
      }
    })()
    return () => {
      cancelled = true
      loaded?.destroy()
    }
  }, [url, isPdf])

  // Track the available width (debounced), so pages render at their real size.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    let t = 0
    const measure = () => setWidth(Math.round(el.clientWidth))
    measure()
    const ro = new ResizeObserver(() => {
      clearTimeout(t)
      t = setTimeout(measure, 150)
    })
    ro.observe(el)
    return () => {
      clearTimeout(t)
      ro.disconnect()
    }
  }, [])

  const pages = doc ? Array.from({ length: doc.numPages }, (_, i) => i + 1) : []

  return (
    <div className={styles.viewer}>
      <div className={styles.toolbar}>
        <span className="label">
          {status === "ready"
            ? `${doc.numPages} PAGE${doc.numPages === 1 ? "" : "S"}`
            : status === "loading"
              ? "LOADING…"
              : status === "other"
                ? "DOCUMENT"
                : "PREVIEW UNAVAILABLE"}
        </span>
        <span className={styles.actions}>
          <a href={url} target="_blank" rel="noreferrer" className={styles.action} data-cursor="interactive">
            OPEN ↗
          </a>
          <a href={downloadUrl(url, fileName)} className={styles.action} data-cursor="interactive">
            DOWNLOAD
          </a>
        </span>
      </div>

      <div ref={wrapRef} className={styles.pages} aria-label={title} aria-busy={status === "loading"}>
        {status === "loading" && <div className={styles.placeholder} style={{ aspectRatio: `1 / ${ratio}` }} />}

        {status === "error" && (
          <p className={styles.error}>
            The preview couldn&rsquo;t load here.{" "}
            <a href={url} target="_blank" rel="noreferrer">
              Open the PDF
            </a>{" "}
            instead.
          </p>
        )}

        {status === "other" && (
          <p className={styles.error}>
            This version is a document file, so it can&rsquo;t be previewed here.{" "}
            <a href={downloadUrl(url, fileName)}>Download it</a> instead.
          </p>
        )}

        {status === "ready" &&
          width > 0 &&
          pages.map((n) => <PdfPage key={n} doc={doc} pageNumber={n} width={width} ratio={ratio} title={title} />)}
      </div>
    </div>
  )
}

function PdfPage({ doc, pageNumber, width, ratio, title }) {
  const holderRef = useRef(null)
  const canvasRef = useRef(null)
  const [visible, setVisible] = useState(pageNumber === 1)
  const [drawn, setDrawn] = useState(false)

  // Draw only once the page is near the viewport.
  useEffect(() => {
    const el = holderRef.current
    if (!el || visible) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: "600px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  useEffect(() => {
    if (!visible || !width) return
    let task = null
    let cancelled = false
    ;(async () => {
      try {
        const page = await doc.getPage(pageNumber)
        if (cancelled) return
        const base = page.getViewport({ scale: 1 })
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const viewport = page.getViewport({ scale: (width / base.width) * dpr })
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        task = page.render({ canvasContext: canvas.getContext("2d"), viewport })
        await task.promise
        if (!cancelled) setDrawn(true)
      } catch (e) {
        if (e?.name !== "RenderingCancelledException") console.error("PdfPage", e)
      }
    })()
    return () => {
      cancelled = true
      task?.cancel()
    }
  }, [doc, pageNumber, width, visible])

  return (
    <div
      ref={holderRef}
      className={styles.page}
      data-drawn={drawn ? "true" : "false"}
      style={{ aspectRatio: `1 / ${ratio}` }}
    >
      <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label={`${title}, page ${pageNumber}`} />
    </div>
  )
}

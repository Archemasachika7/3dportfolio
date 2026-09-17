"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { describeFormat } from "./formats"
import styles from "./ModelBlock.module.css"

// three.js touches window/document at import time, so it must never be
// server-rendered.
const CadViewer = dynamic(() => import("./CadViewer"), { ssr: false })

/**
 * A single 3D model attached to a project. CAD files are routinely tens of
 * megabytes, so the geometry is only fetched once the visitor asks for it.
 */
export default function ModelBlock({ url, caption, alt }) {
  const [open, setOpen] = useState(false)
  const format = describeFormat(url)
  const fileName = decodeURIComponent(String(url).split(/[?#]/)[0].split("/").pop() || "model")

  if (open) {
    return (
      <figure className={styles.block}>
        <CadViewer url={url} name={fileName} onClose={() => setOpen(false)} />
        {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
      </figure>
    )
  }

  return (
    <figure className={styles.block}>
      <div className={styles.placard}>
        <div className={styles.placardTop}>
          <span className={styles.badge}>{format.supported ? format.label : "3D MODEL"}</span>
          <span className={styles.fileName}>{fileName}</span>
        </div>

        <p className={styles.blurb}>
          {alt || "Interactive 3D model — orbit, pan and zoom in the browser."}
        </p>

        <div className={styles.actions}>
          {format.supported ? (
            <button
              type="button"
              className={styles.openBtn}
              onClick={() => setOpen(true)}
              data-cursor="interactive"
            >
              OPEN 3D MODEL →
            </button>
          ) : (
            <span className={styles.unsupported}>
              {format.label} can&rsquo;t be opened in a browser — download to view.
            </span>
          )}
          <a
            href={url}
            download
            className={styles.downloadLink}
            data-cursor="interactive"
          >
            DOWNLOAD
          </a>
        </div>
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}

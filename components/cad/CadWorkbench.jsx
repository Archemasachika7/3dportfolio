"use client"

import { useCallback, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { ACCEPT_EXTENSIONS, SUPPORTED_SUMMARY, describeFormat } from "./formats"
import styles from "./CadWorkbench.module.css"

const CadViewer = dynamic(() => import("./CadViewer"), { ssr: false })

/**
 * Standalone CAD workbench: opens a model straight from the visitor's machine.
 * Nothing is uploaded — the file is read in the browser and rendered locally.
 */
export default function CadWorkbench({ samples = [] }) {
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState(null)
  const [name, setName] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [rejected, setRejected] = useState(null)
  const inputRef = useRef(null)

  const accept = useCallback((incoming) => {
    if (!incoming) return
    const format = describeFormat(incoming.name)
    if (!format.supported) {
      setRejected(
        format.reason === "native"
          ? `${format.label} is a proprietary format that can't be read in a browser. Export it to STEP or STL first.`
          : `.${format.ext || "?"} isn't a format this viewer can open.`
      )
      return
    }
    setRejected(null)
    setUrl(null)
    setName(incoming.name)
    setFile(incoming)
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      setDragging(false)
      accept(event.dataTransfer.files?.[0])
    },
    [accept]
  )

  const reset = useCallback(() => {
    setFile(null)
    setUrl(null)
    setName(null)
    setRejected(null)
  }, [])

  if (file || url) {
    return (
      <div className={styles.stage}>
        <div className={styles.stageBar}>
          <span className={styles.stageName}>{name}</span>
          <button type="button" className={styles.reset} onClick={reset} data-cursor="interactive">
            OPEN ANOTHER
          </button>
        </div>
        <CadViewer file={file} url={url} name={name} />
        <p className={styles.privacy}>
          This file was read locally in your browser. Nothing was uploaded.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.stage}>
      <div
        className={styles.dropzone}
        data-dragging={dragging}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        data-cursor="interactive"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_EXTENSIONS}
          className={styles.hiddenInput}
          onChange={(event) => {
            accept(event.target.files?.[0])
            event.target.value = ""
          }}
        />
        <span className={styles.dropTitle}>DROP A MODEL — OR CLICK TO BROWSE</span>
        <span className={styles.dropFormats}>{SUPPORTED_SUMMARY}</span>
        <span className={styles.dropNote}>
          Files are read in your browser. Nothing is uploaded to a server.
        </span>
      </div>

      {rejected && <p className={styles.rejected}>{rejected}</p>}

      {samples.length > 0 && (
        <div className={styles.samples}>
          <span className="label">FROM MY WORK</span>
          <div className={styles.sampleList}>
            {samples.map((sample) => (
              <button
                key={sample.url}
                type="button"
                className={styles.sample}
                data-cursor="interactive"
                onClick={() => {
                  setRejected(null)
                  setFile(null)
                  setName(sample.name)
                  setUrl(sample.url)
                }}
              >
                <span className={styles.sampleTitle}>{sample.title}</span>
                <span className={styles.sampleMeta}>{describeFormat(sample.url).label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

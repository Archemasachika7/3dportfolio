"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { loadModel } from "./loadModel"
import { SUPPORTED_SUMMARY } from "./formats"
import styles from "./CadViewer.module.css"

/**
 * Interactive CAD / 3D model viewer.
 *
 * Renders either a remote model (`url`) or a local one the visitor opened
 * (`file`). CAD files are frequently tens of megabytes, so nothing is fetched
 * until `active` is true — project pages keep the viewer behind an explicit
 * "Open model" affordance rather than pulling geometry on page load.
 */
export default function CadViewer({ url, file, name, active = true, onClose }) {
  const mountRef = useRef(null)
  const ctxRef = useRef(null)

  const [status, setStatus] = useState("idle") // idle | loading | ready | error
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [wireframe, setWireframe] = useState(false)

  /* ---- scene setup: runs once, independent of which model is shown ---- */
  useEffect(() => {
    if (!active) return
    const mount = mountRef.current
    if (!mount) return

    let disposed = false
    let frame = 0
    const ctx = {}
    ctxRef.current = ctx

    ;(async () => {
      const THREE = await import("three")
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js")
      if (disposed) return

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf5f4f0) // --bg, so the viewer sits on the page rather than punching a hole in it

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000)
      camera.position.set(90, 70, 110)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      renderer.shadowMap.enabled = false
      mount.appendChild(renderer.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.rotateSpeed = 0.75
      controls.panSpeed = 0.8

      // Neutral three-point studio lighting — reads as a machine-shop render
      // rather than a game engine.
      scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9da3, 2.1))
      const key = new THREE.DirectionalLight(0xffffff, 2.0)
      key.position.set(1, 1.6, 1)
      scene.add(key)
      const fill = new THREE.DirectionalLight(0xffffff, 0.8)
      fill.position.set(-1.2, 0.4, -0.8)
      scene.add(fill)

      const grid = new THREE.GridHelper(400, 40, 0x0b0c0e, 0xc9c8c3)
      grid.material.opacity = 0.32
      grid.material.transparent = true
      scene.add(grid)

      Object.assign(ctx, { THREE, scene, camera, renderer, controls, grid, mount, model: null })

      const resize = () => {
        if (!mount.clientWidth || !mount.clientHeight) return
        camera.aspect = mount.clientWidth / mount.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(mount.clientWidth, mount.clientHeight)
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(mount)
      ctx.observer = observer

      // Render continuously only while on screen, so an off-screen viewer
      // costs nothing.
      let visible = true
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
      })
      io.observe(mount)
      ctx.io = io

      const tick = () => {
        frame = requestAnimationFrame(tick)
        if (!visible) return
        controls.update()
        renderer.render(scene, camera)
      }
      tick()
      ctx.stop = () => cancelAnimationFrame(frame)
    })()

    return () => {
      disposed = true
      const ctx = ctxRef.current
      if (!ctx) return
      ctx.stop?.()
      ctx.observer?.disconnect()
      ctx.io?.disconnect()
      ctx.controls?.dispose()
      // three.js holds GPU resources that garbage collection never reclaims —
      // every geometry, material and texture has to be released explicitly.
      ctx.scene?.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material) => {
          if (!material) return
          Object.values(material).forEach((value) => {
            if (value && value.isTexture) value.dispose()
          })
          material.dispose()
        })
      })
      ctx.renderer?.dispose()
      if (ctx.renderer?.domElement?.parentNode) {
        ctx.renderer.domElement.parentNode.removeChild(ctx.renderer.domElement)
      }
      ctxRef.current = null
    }
  }, [active])

  /** Frames the camera on the model's bounding sphere. */
  const frameModel = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx?.model) return
    const { THREE, model, camera, controls } = ctx

    const box = new THREE.Box3().setFromObject(model)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    const center = sphere.center
    const radius = sphere.radius || 1

    const fitDistance = (radius * 1.45) / Math.sin((camera.fov * Math.PI) / 360)
    const direction = new THREE.Vector3(0.75, 0.55, 1).normalize()

    camera.position.copy(center).addScaledVector(direction, fitDistance)
    camera.near = Math.max(radius / 500, 0.01)
    camera.far = fitDistance + radius * 8
    camera.updateProjectionMatrix()

    controls.target.copy(center)
    controls.maxDistance = fitDistance * 4
    controls.update()
  }, [])

  /* ---- load the requested model ---- */
  useEffect(() => {
    if (!active || (!url && !file)) return
    let cancelled = false

    const run = async () => {
      // Wait for the scene effect above to finish its dynamic imports.
      for (let i = 0; i < 100 && !ctxRef.current?.scene; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
      const ctx = ctxRef.current
      if (cancelled || !ctx?.scene) return

      setStatus("loading")
      setProgress(null)
      setError(null)

      try {
        const { object, format } = await loadModel({
          url,
          file,
          onProgress: (pct) => !cancelled && setProgress(pct)
        })
        if (cancelled) return

        const { THREE, scene } = ctx
        if (ctx.model) scene.remove(ctx.model)

        // CAD tools are overwhelmingly Z-up; three.js is Y-up.
        if (format.loader === "occt") object.rotation.x = -Math.PI / 2

        scene.add(object)
        ctx.model = object

        const box = new THREE.Box3().setFromObject(object)
        const size = box.getSize(new THREE.Vector3())

        let triangles = 0
        object.traverse((child) => {
          if (!child.isMesh || !child.geometry) return
          const geometry = child.geometry
          triangles += geometry.index
            ? geometry.index.count / 3
            : (geometry.attributes.position?.count ?? 0) / 3
        })

        // Sit the grid directly under the part, scaled to it, so it reads as a
        // shop floor whether the model is a 10mm bolt or a 3m frame.
        const span = Math.max(size.x, size.y, size.z) || 1
        const center = box.getCenter(new THREE.Vector3())
        ctx.grid.scale.setScalar(Math.max(span / 200, 0.02))
        ctx.grid.position.set(center.x, box.min.y, center.z)

        setInfo({
          format: format.label,
          triangles: Math.round(triangles),
          size: { x: size.x, y: size.y, z: size.z }
        })
        frameModel()
        setStatus("ready")
      } catch (loadError) {
        if (cancelled) return
        setError(loadError.message || "Could not open this model.")
        setStatus("error")
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [url, file, active, frameModel])

  /* ---- wireframe toggle ---- */
  useEffect(() => {
    const model = ctxRef.current?.model
    if (!model) return
    model.traverse((child) => {
      if (!child.isMesh) return
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => {
        if (material) material.wireframe = wireframe
      })
    })
  }, [wireframe, status])

  const dimension = (value) => (value >= 1000 ? `${(value / 1000).toFixed(2)}m` : `${value.toFixed(1)}`)

  return (
    <div className={styles.viewer}>
      <div ref={mountRef} className={styles.canvas} data-status={status} />

      {status !== "ready" && (
        <div className={styles.overlay}>
          {status === "loading" && (
            <div className={styles.loading}>
              <span className={styles.loadingLabel}>
                {progress === null ? "LOADING MODEL" : `LOADING MODEL — ${progress}%`}
              </span>
              <div className={styles.track}>
                <div
                  className={styles.bar}
                  style={progress === null ? { width: "40%" } : { width: `${progress}%` }}
                  data-indeterminate={progress === null}
                />
              </div>
              {name && <span className={styles.fileName}>{name}</span>}
            </div>
          )}

          {status === "error" && (
            <div className={styles.errorBox}>
              <span className={styles.errorTitle}>UNABLE TO OPEN</span>
              <p className={styles.errorMsg}>{error}</p>
              <span className={styles.supported}>SUPPORTED — {SUPPORTED_SUMMARY}</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {info && (
            <>
              <span className={styles.chip}>{info.format}</span>
              <span className={styles.readout}>
                {dimension(info.size.x)} × {dimension(info.size.y)} × {dimension(info.size.z)}
              </span>
              <span className={styles.readout}>{info.triangles.toLocaleString()} tris</span>
            </>
          )}
        </div>
        <div className={styles.toolbarRight}>
          <button
            type="button"
            className={styles.tool}
            onClick={frameModel}
            disabled={status !== "ready"}
            data-cursor="interactive"
          >
            FIT
          </button>
          <button
            type="button"
            className={styles.tool}
            onClick={() => setWireframe((v) => !v)}
            disabled={status !== "ready"}
            data-active={wireframe}
            data-cursor="interactive"
          >
            WIREFRAME
          </button>
          {onClose && (
            <button type="button" className={styles.tool} onClick={onClose} data-cursor="interactive">
              CLOSE
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

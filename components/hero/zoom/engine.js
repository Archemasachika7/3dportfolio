/**
 * Continuous-zoom engine. A scene is six drawings at successive scales;
 * the camera draws each one in, then pushes through its focus into the
 * next (Z× per level). Scenes play as chapters: in the last slot of one,
 * the first drawing of the next fades in at natural scale, so the whole
 * sequence loops without a visible seam.
 *
 * Playback is owned by the caller (see ScaleZoom.jsx): render(t) for any
 * time, drawIn(p) for the opening, onLevel(scene, level) for the readout.
 */
import { el, createKit, INK } from "./kit"

export const TOTAL = 14 // seconds per chapter
const N = 6 // levels per chapter
const D = TOTAL / N
const Z = 5.5 // scale factor between adjacent levels

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

function bezierEase(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by
  const fx = (t) => ((ax * t + bx) * t + cx) * t
  const dfx = (t) => (3 * ax * t + 2 * bx) * t + cx
  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const e = fx(t) - x
      if (Math.abs(e) < 1e-6) break
      const d = dfx(t)
      if (Math.abs(d) < 1e-6) break
      t -= e / d
    }
    t = clamp(t, 0, 1)
    return ((ay * t + by) * t + cy) * t
  }
}
const ease = bezierEase(0.65, 0, 0.08, 1) // --ease-cinematic

function buildSheet(g) {
  const G = el("g", { stroke: INK, "stroke-width": 1, opacity: 0.055 }, g)
  for (let x = 0; x <= 1920; x += 64) el("line", { x1: x, y1: 0, x2: x, y2: 1200 }, G)
  for (let y = 0; y <= 1200; y += 64) el("line", { x1: 0, y1: y, x2: 1920, y2: y }, G)
  el("rect", { x: 48, y: 48, width: 1824, height: 1104, fill: "none", stroke: INK, "stroke-width": 1, opacity: 0.28 }, g)
}

/** Staggered dash draw-on for one group at progress v. Skips unchanged. */
function paint(set, v) {
  for (let i = 0; i < set.els.length; i++) {
    const e = set.els[i]
    const d = clamp((v - 0.55 * (e.__s / set.max)) / 0.45, 0, 1)
    if (e.__d === d) continue
    e.__d = d
    if (e.hasAttribute("data-t")) {
      e.style.opacity = d
    } else {
      e.style.strokeDashoffset = 1 - d
      const f = e.getAttribute("fill")
      if ((f && f !== "none") || e.hasAttribute("data-fill")) e.style.fillOpacity = d
    }
  }
}

function collect(root) {
  const els = Array.from(root.children)
  let max = 1
  els.forEach((e) => {
    e.__s = +e.getAttribute("data-s") || 0
    if (e.__s + 1 > max) max = e.__s + 1
  })
  return { els, max }
}

export function createScaleZoom(svg, scenes, { sheet = false, onLevel } = {}) {
  svg.textContent = ""
  if (sheet) buildSheet(el("g", null, svg))
  const kit = createKit()

  const chapters = scenes.map((scene) => {
    const root = el("g", { style: "display:none" }, svg)
    const levels = scene.levels.map((level) => {
      const g = el("g", null, root)
      const art = el("g", null, g)
      const anno = el("g", null, g)
      level.build(kit, art, anno)
      return { g, art: collect(art), anno: collect(anno) }
    })
    return { root, levels, shown: false }
  })
  const count = chapters.length

  const showChapter = (C, on) => {
    if (C.shown === on) return
    C.shown = on
    C.root.style.display = on ? "" : "none"
  }

  const showLevel = (L, op, scale) => {
    if (op < 0.01) {
      if (L.g.style.display !== "none") L.g.style.display = "none"
      return false
    }
    L.g.style.display = ""
    L.g.style.opacity = op
    L.g.setAttribute("transform", `translate(960,600) scale(${scale}) translate(-960,-600)`)
    return true
  }

  let reported = ""
  const report = (c, j) => {
    const key = c + ":" + j
    if (key !== reported) {
      reported = key
      onLevel?.(c, j)
    }
  }

  /** Render the whole sequence at time T (seconds; wraps). */
  function render(T) {
    const span = count * TOTAL
    T = ((T % span) + span) % span
    const c = Math.floor(T / TOTAL)
    const next = (c + 1) % count
    const t = T - c * TOTAL
    const u = t / D, k = Math.min(Math.floor(u), N - 1), f = u - k
    const camExp = k + ease(clamp((f - 0.4) / 0.6, 0, 1)) + 0.08 * Math.sin(Math.PI * f)
    const closing = k === N - 1
    const loopFade = closing ? smoothstep(0.72, 0.99, f) : 0

    chapters.forEach((C, i) => showChapter(C, i === c || (closing && i === next)))

    const C = chapters[c]
    let best = 0, bestOp = -1
    for (let j = 0; j < N; j++) {
      const L = C.levels[j]
      const e = camExp - j
      let op = clamp(smoothstep(-0.85, -0.15, e) * (1 - smoothstep(0.15, 0.85, e)), 0, 1)
      const dr = clamp((e + 0.85) / 0.85, 0, 1)
      const an = clamp((k - j + f - 0.06) / 0.3, 0, 1)
      // Closing slot: this chapter's own first drawing stays hidden unless
      // it's also the next chapter (a single-scene loop).
      if (closing && j === 0) op = next === c ? loopFade : 0
      if (op > bestOp) {
        bestOp = op
        best = j
      }
      if (!showLevel(L, op, next === c && closing && j === 0 ? 1 : Math.pow(Z, e))) continue
      paint(L.art, closing && j === 0 ? 1 : dr)
      paint(L.anno, closing && j === 0 ? 0 : an)
    }

    // The next chapter's first drawing fades in at natural scale, fully
    // drawn, matching exactly how that chapter's own t = 0 frame looks.
    if (closing && next !== c) {
      const Nx = chapters[next]
      Nx.levels.forEach((L, j) => {
        if (j === 0 && showLevel(L, loopFade, 1)) {
          paint(L.art, 1)
          paint(L.anno, 0)
        } else if (j !== 0) {
          showLevel(L, 0, 1)
        }
      })
      if (loopFade > bestOp) return report(next, 0)
    }
    report(c, best)
  }

  /** The opening: the first chapter's first drawing draws itself in. */
  function drawIn(p) {
    chapters.forEach((C, i) => showChapter(C, i === 0))
    chapters[0].levels.forEach((L, j) => {
      if (j === 0) {
        showLevel(L, 1, 1)
        paint(L.art, p)
        paint(L.anno, 0)
      } else {
        showLevel(L, 0, 1)
      }
    })
    report(0, 0)
  }

  return { render, drawIn, duration: count * TOTAL }
}

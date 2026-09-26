/**
 * Drawing kit shared by every zoom scene. Each primitive is an SVG element
 * set up for a dash draw-on (pathLength 1) and stamped with the current
 * draw step; scenes call begin() before a group and step() between strokes
 * that should draw in sequence.
 *
 * Colours are theme tokens: INK is currentColor, ACCENT and PAPER are CSS
 * variables (written as inline style, since SVG presentation attributes
 * can't hold var()).
 */

export const SVG_NS = "http://www.w3.org/2000/svg"
export const INK = "currentColor"
export const ACCENT = "var(--accent)"
export const PAPER = "var(--bg)"

/** Shallow merge that ignores undefined values, so `{ fill: undefined }`
 * means "keep the default" rather than "erase it". */
export function merge(...objs) {
  const out = {}
  for (const o of objs) if (o) for (const k in o) if (o[k] !== undefined) out[k] = o[k]
  return out
}

export function el(tag, attrs, parent) {
  const n = document.createElementNS(SVG_NS, tag)
  if (attrs) {
    for (const k in attrs) {
      const v = attrs[k]
      if (v === undefined) continue
      if (typeof v === "string" && v.startsWith("var(")) {
        n.style.setProperty(k, v)
        if (k === "fill") n.setAttribute("data-fill", "1")
      } else {
        n.setAttribute(k, v)
      }
    }
  }
  if (parent) parent.appendChild(n)
  return n
}

/** Deterministic PRNG, so a scene is identical on every visit. */
export function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

export function createKit() {
  let STEP = 0
  const THIN = { stroke: INK, "stroke-width": 0.6, opacity: 0.5 }
  const TICK = { stroke: INK, "stroke-width": 0.9, opacity: 0.6 }
  const ACC = { stroke: ACCENT, "stroke-width": 1.5 }
  const base = { fill: "none", "stroke-width": 1.25, stroke: INK }

  const begin = () => (STEP = 0)
  const step = () => STEP++

  function S(n) {
    n.setAttribute("pathLength", "1")
    n.setAttribute("stroke-dasharray", "1")
    n.setAttribute("stroke-dashoffset", "1")
    n.setAttribute("data-s", STEP)
    return n
  }

  const line = (x1, y1, x2, y2, a, p) => S(el("line", merge({ x1, y1, x2, y2 }, base, a), p))
  const poly = (pts, a, p) =>
    S(el("polyline", merge({ points: pts.map((q) => q[0] + "," + q[1]).join(" ") }, base, a), p))
  const pathEl = (d, a, p) => S(el("path", merge({ d }, base, a), p))
  const rectEl = (x, y, w, h, a, p) => S(el("rect", merge({ x, y, width: w, height: h }, base, a), p))
  const circ = (cx, cy, r, a, p) => S(el("circle", merge({ cx, cy, r }, base, a), p))
  const ellipse = (cx, cy, rx, ry, rot, a, p) =>
    S(el("ellipse", merge({ cx, cy, rx, ry, transform: `rotate(${rot} ${cx} ${cy})` }, base, a), p))

  function label(x, y, txt, a, p) {
    const n = el("text", merge({ x, y, "font-size": 10, "letter-spacing": "0.12em", fill: INK, "font-weight": 400 }, a), p)
    n.style.fontFamily = "var(--font-mono)"
    n.textContent = String(txt)
    n.setAttribute("data-t", "1")
    n.setAttribute("data-s", STEP)
    return n
  }

  // diagonal hatch clipped to a rect (default 45 degrees)
  function hatch(x, y, w, h, sp, p, a, angle) {
    const rad = ((angle === undefined ? 45 : angle) * Math.PI) / 180
    const dx = Math.cos(rad), dy = Math.sin(rad)
    const cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h), n = Math.ceil(R / sp)
    for (let i = -n; i <= n; i++) {
      const px = cx - dy * i * sp, py = cy + dx * i * sp
      let ta = -R, tb = R, ok = true
      const cl = (P, D, lo, hi) => {
        if (Math.abs(D) < 1e-6) {
          if (P < lo || P > hi) ok = false
        } else {
          const u0 = (lo - P) / D, u1 = (hi - P) / D
          ta = Math.max(ta, Math.min(u0, u1))
          tb = Math.min(tb, Math.max(u0, u1))
        }
      }
      cl(px, dx, x, x + w)
      if (!ok) continue
      cl(py, dy, y, y + h)
      if (!ok) continue
      if (tb - ta > 0.5) line(px + dx * ta, py + dy * ta, px + dx * tb, py + dy * tb, merge(THIN, a), p)
    }
  }

  // dashed line as short segments so the draw-on still works
  function dashed(x1, y1, x2, y2, on, off, a, p) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, per = on + off
    for (let s = 0; s < L - on; s += per)
      line(x1 + ux * s, y1 + uy * s, x1 + ux * (s + on), y1 + uy * (s + on), merge(THIN, a), p)
  }

  function dimH(x1, x2, y, txt, p, side) {
    side = side || 1
    line(x1, y - 9 * side, x1, y + 9 * side, THIN, p)
    line(x2, y - 9 * side, x2, y + 9 * side, THIN, p)
    line(x1, y, x2, y, THIN, p)
    pathEl("M" + x1 + " " + y + " l6 -2.4 M" + x1 + " " + y + " l6 2.4", TICK, p)
    pathEl("M" + x2 + " " + y + " l-6 -2.4 M" + x2 + " " + y + " l-6 2.4", TICK, p)
    if (txt) label((x1 + x2) / 2, y - 7 * side, txt, { "text-anchor": "middle" }, p)
  }

  function dimV(x, y1, y2, txt, p, side) {
    side = side || 1
    line(x - 9 * side, y1, x + 9 * side, y1, THIN, p)
    line(x - 9 * side, y2, x + 9 * side, y2, THIN, p)
    line(x, y1, x, y2, THIN, p)
    pathEl("M" + x + " " + y1 + " l-2.4 6 M" + x + " " + y1 + " l2.4 6", TICK, p)
    pathEl("M" + x + " " + y2 + " l-2.4 -6 M" + x + " " + y2 + " l2.4 -6", TICK, p)
    if (txt) {
      const tx = x - 7 * side, ty = (y1 + y2) / 2
      label(tx, ty, txt, { "text-anchor": "middle", transform: "rotate(-90 " + tx + " " + ty + ")" }, p)
    }
  }

  function leader(x1, y1, x2, y2, txt, accent, p) {
    const c = accent ? ACCENT : INK, dir = x2 >= x1 ? 1 : -1
    poly([[x1, y1], [x2, y2], [x2 + dir * 38, y2]], { stroke: c, "stroke-width": 1 }, p)
    if (txt) label(x2 + dir * 6, y2 - 6, txt, { fill: c, "text-anchor": dir > 0 ? "start" : "end" }, p)
  }

  function bubble(cx, cy, r, txt, p) {
    circ(cx, cy, r, { stroke: INK, "stroke-width": 1, opacity: 0.7, fill: PAPER }, p)
    label(cx, cy + 3.5, txt, { "text-anchor": "middle", "font-size": 9, opacity: 0.85 }, p)
  }

  function zigzag(x, y, w, h, n, p) {
    const pts = [], st = w / n
    for (let i = 0; i <= n; i++) pts.push([x + i * st, y + (i % 2 ? h : 0)])
    poly(pts, { stroke: INK, "stroke-width": 0.9, opacity: 0.6 }, p)
  }

  /** Straight connector with an open arrowhead at (x2, y2). */
  function arrow(x1, y1, x2, y2, a, p) {
    line(x1, y1, x2, y2, a, p)
    const ang = Math.atan2(y2 - y1, x2 - x1), L = 9, W = 0.42
    const ax = x2 - L * Math.cos(ang - W), ay = y2 - L * Math.sin(ang - W)
    const bx = x2 - L * Math.cos(ang + W), by = y2 - L * Math.sin(ang + W)
    pathEl(`M${ax} ${ay} L${x2} ${y2} L${bx} ${by}`, merge(a, { "stroke-width": 1 }), p)
  }

  return {
    begin, step, line, poly, pathEl, rectEl, circ, ellipse, label, hatch, dashed,
    dimH, dimV, leader, bubble, zigzag, arrow, THIN, TICK, ACC
  }
}

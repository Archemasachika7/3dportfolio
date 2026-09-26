/**
 * Chapter 01 — STRUCTURE. Site elevation → tower → floor plate →
 * beam–column joint → rebar cage → concrete microstructure.
 * (The original STRUCTURAL SCALE — CONTINUOUS ZOOM drawing.)
 */
import { INK, ACCENT, PAPER, seeded } from "./kit"

// ===== LEVEL 0 — SCALE 1:500 — SITE ELEVATION (city skyline) =====
function level0(k, art, anno) {
  const { line, poly, pathEl, rectEl, circ, label, hatch, dashed, dimH, dimV, leader, bubble, zigzag, begin, step, THIN } = k
  begin()
  const GY = 980
  line(40, GY, 1880, GY, { stroke: INK, "stroke-width": 1.5 }, art); step()
  line(40, GY + 9, 1880, GY + 9, THIN, art)
  for (let x = 54; x < 1870; x += 74) line(x, GY, x + 18, GY + 9, THIN, art)
  step()
  const B = [[56,190,112],[182,330,124],[320,258,96],[430,540,132],[576,308,104],[694,420,118],[935,810,150],[1128,268,102],[1244,458,132],[1390,308,106],[1512,572,140],[1668,224,96],[1778,388,122]]
  for (let i = 0; i < B.length; i++) {
    if (i === 6) continue
    const x = B[i][0], h = B[i][1], w = B[i][2], top = GY - h
    rectEl(x, top, w, h, { stroke: INK, "stroke-width": 1.25 }, art)
    const fl = Math.max(2, Math.round(h / 72))
    for (let q = 1; q < fl; q++) line(x + 3, top + (h * q) / fl, x + w - 3, top + (h * q) / fl, THIN, art)
    const mu = Math.max(1, Math.round(w / 52))
    for (let q = 1; q < mu; q++) line(x + (w * q) / mu, top + 5, x + (w * q) / mu, GY - 3, THIN, art)
    if (i % 2 === 0) hatch(x + w * 0.58, top + 8, w * 0.38, h - 16, 42, art, { opacity: 0.32 })
    if (i % 4 === 0) {
      line(x + w * 0.45, top, x + w * 0.45, top - 30, THIN, art)
      line(x + w * 0.33, top - 21, x + w * 0.57, top - 21, THIN, art)
      line(x + w * 0.36, top - 9, x + w * 0.54, top - 9, THIN, art)
    } else if (i % 4 === 1) {
      line(x - 7, top, x + w + 7, top, THIN, art)
      line(x, top - 15, x + w, top - 15, THIN, art)
    } else if (i % 4 === 2) {
      rectEl(x + w * 0.28, top - 24, w * 0.44, 24, THIN, art)
    } else {
      pathEl("M" + x + " " + top + " L" + (x + w / 2) + " " + (top - 34) + " L" + (x + w) + " " + top, THIN, art)
    }
    step()
  }
  // FOCUS: the tower the camera pushes into
  const tx = 935, th = 810, tw = 150, ttop = GY - th
  rectEl(tx, ttop, tw, th, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  line(tx + tw * 0.3, ttop, tx + tw * 0.3, GY, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  line(tx + tw * 0.7, ttop, tx + tw * 0.7, GY, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  step()
  for (let q = 1; q < 20; q++) line(tx + 4, ttop + (th * q) / 20, tx + tw - 4, ttop + (th * q) / 20, THIN, art)
  step()
  line(tx + tw / 2, ttop, tx + tw / 2, ttop - 46, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  line(tx + tw / 2 - 13, ttop - 31, tx + tw / 2 + 13, ttop - 31, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  line(tx + tw / 2 - 10, ttop - 19, tx + tw / 2 + 10, ttop - 19, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  step()
  begin()
  label(64, 80, "SCALE 1:500", {}, anno); label(64, 98, "SITE ELEVATION", {}, anno); step()
  line(866, ttop, tx, ttop, THIN, anno); line(866, GY, tx, GY, THIN, anno); step()
  dimV(876, ttop, GY, "H 96 000", anno); step()
  line(64, 1130, 320, 1130, THIN, anno)
  for (let i = 0; i <= 4; i++) {
    line(64 + i * 64, 1124, 64 + i * 64, 1136, THIN, anno)
    label(58 + i * 64, 1152, ["0", "25", "50", "75", "100"][i], {}, anno)
  }
  step()
  leader(1010, 124, 1246, 62, "TOWER A", true, anno); step()
}

// ===== LEVEL 1 — SCALE 1:100 — TOWER ELEVATION =====
function level1(k, art, anno) {
  const { line, poly, pathEl, rectEl, circ, label, hatch, dashed, dimH, dimV, leader, bubble, zigzag, begin, step, THIN } = k
  begin()
  const x0 = 300, x1 = 1620, y0 = 140, y1 = 1100, W = x1 - x0, H = y1 - y0
  rectEl(x0, y0, W, H, { stroke: INK, "stroke-width": 1.5 }, art); step()
  for (let i = 1; i < 22; i++) line(x0 + 4, y0 + (H * i) / 22, x1 - 4, y0 + (H * i) / 22, THIN, art)
  step()
  for (let i = 1; i < 10; i++) line(x0 + (W * i) / 10, y0 + 6, x0 + (W * i) / 10, y1 - 4, THIN, art)
  step()
  hatch(x0 + W * 0.42, y0 + 10, W * 0.16, H - 20, 20, art, { opacity: 0.3 })
  step()
  line(x0, y0 - 14, x1, y0 - 14, { stroke: INK, "stroke-width": 1.25 }, art)
  rectEl(x0 + W * 0.18, y0 - 62, W * 0.2, 48, { stroke: INK, "stroke-width": 1.25 }, art)
  line(x0 + W * 0.72, y0 - 14, x0 + W * 0.72, y0 - 104, { stroke: INK, "stroke-width": 1.25 }, art)
  line(x0 + W * 0.72 - 15, y0 - 76, x0 + W * 0.72 + 15, y0 - 76, THIN, art)
  line(x0 + W * 0.72 - 11, y0 - 52, x0 + W * 0.72 + 11, y0 - 52, THIN, art)
  step()
  line(x0 - 44, y1, x1 + 44, y1, { stroke: INK, "stroke-width": 1.5 }, art)
  line(x0 + W * 0.36, y1 - 26, x0 + W * 0.64, y1 - 26, { stroke: INK, "stroke-width": 1.25 }, art)
  line(x0 + W * 0.38, y1 - 26, x0 + W * 0.38, y1, THIN, art)
  line(x0 + W * 0.62, y1 - 26, x0 + W * 0.62, y1, THIN, art)
  step()
  // FOCUS: one floor plate — the L-14 slab edge
  const ly = 420
  line(x0 - 26, ly, x1 + 26, ly, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  line(x0 - 26, ly - 10, x1 + 26, ly - 10, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  rectEl(x1 + 30, ly - 16, 30, 26, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  step()
  begin()
  label(64, 80, "SCALE 1:100", {}, anno); label(64, 98, "TOWER ELEVATION", {}, anno); step()
  dimV(210, y0, y1, "H 96 000", anno); step()
  const fl = ["F22", "F18", "F14", "F10", "F6", "F2"]
  for (let i = 0; i < 6; i++) {
    const yy = y0 + (H * (i + 1)) / 6
    line(196, yy, 214, yy, THIN, anno)
    label(188, yy + 3.5, fl[i], { "text-anchor": "end" }, anno)
  }
  step()
  line(x1, y0 - 14, 1730, y0 - 14, THIN, anno); label(1734, y0 - 10, "PARAPET", {}, anno); step()
  dimH(x0, x1, y1 + 56, "FACADE 34 000", anno); step()
  label(64, y1 + 56, "FACADE GRID 3.6 M", {}, anno); step()
  leader(x1, ly, 1750, ly - 72, "L-14 SLAB EDGE", true, anno); step()
}

// ===== LEVEL 2 — SCALE 1:20 — TYPICAL FLOOR PLAN =====
function level2(k, art, anno) {
  const { line, poly, pathEl, rectEl, circ, label, hatch, dashed, dimH, dimV, leader, bubble, zigzag, begin, step, THIN } = k
  begin()
  const sx0 = 340, sx1 = 1580, sy0 = 200, sy1 = 1000
  const gx = [340, 650, 960, 1270, 1580], gy = [200, 466.7, 733.3, 1000]
  const gxA = ["A", "B", "C", "D", "E"], gyN = ["1", "2", "3", "4"]
  rectEl(sx0, sy0, sx1 - sx0, sy1 - sy0, { stroke: INK, "stroke-width": 1.5 }, art)
  rectEl(sx0 + 14, sy0 + 14, sx1 - sx0 - 28, sy1 - sy0 - 28, { stroke: INK, "stroke-width": 1.25 }, art)
  step()
  for (let i = 0; i < gx.length; i++) dashed(gx[i], 110, gx[i], 1070, 48, 18, {}, art)
  step()
  for (let i = 0; i < gy.length; i++) dashed(250, gy[i], 1670, gy[i], 48, 18, {}, art)
  step()
  for (let i = 0; i < gx.length; i++) { line(gx[i], 110, gx[i], 68, THIN, art); bubble(gx[i], 52, 15, gxA[i], art) }
  for (let i = 0; i < gy.length; i++) { line(250, gy[i], 208, gy[i], THIN, art); bubble(192, gy[i], 15, gyN[i], art) }
  step()
  for (let i = 0; i < gx.length; i++) {
    line(gx[i] - 4, sy0 + 20, gx[i] - 4, sy1 - 20, THIN, art)
    line(gx[i] + 4, sy0 + 20, gx[i] + 4, sy1 - 20, THIN, art)
  }
  for (let i = 0; i < gy.length; i++) {
    line(sx0 + 20, gy[i] - 4, sx1 - 20, gy[i] - 4, THIN, art)
    line(sx0 + 20, gy[i] + 4, sx1 - 20, gy[i] + 4, THIN, art)
  }
  step()
  for (let i = 0; i < gx.length; i++)
    for (let j = 0; j < gy.length; j++)
      rectEl(gx[i] - 13, gy[j] - 13, 26, 26, { stroke: INK, "stroke-width": 1.25, fill: INK }, art)
  step()
  rectEl(1020, 560, 220, 300, { stroke: INK, "stroke-width": 1.25 }, art)
  hatch(1020, 560, 220, 300, 16, art, { opacity: 0.28 })
  rectEl(1044, 600, 84, 120, { stroke: INK, "stroke-width": 1 }, art)
  rectEl(1132, 600, 84, 120, { stroke: INK, "stroke-width": 1 }, art)
  pathEl("M1044 600 L1128 720 M1128 600 L1044 720", THIN, art)
  pathEl("M1132 600 L1216 720 M1216 600 L1132 720", THIN, art)
  zigzag(1052, 742, 144, 116, 10, art)
  step()
  // FOCUS: beam–column joint J-04 at grid C/2, with its framing beams
  const jx = gx[2], jy = gy[1]
  rectEl(jx - 19, jy - 19, 38, 38, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  line(jx - 19, jy - 4, jx - 150, jy - 4, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  line(jx - 19, jy + 4, jx - 150, jy + 4, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  line(jx + 19, jy - 4, jx + 150, jy - 4, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  line(jx + 19, jy + 4, jx + 150, jy + 4, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  step()
  begin()
  label(64, 80, "SCALE 1:20", {}, anno); label(64, 98, "TYPICAL FLOOR PLAN", {}, anno); label(64, 116, "L-14", {}, anno); step()
  dimH(sx0, sx1, 1092, "GRID 8.4", anno); step()
  dimV(1706, sy0, sy1, "GRID 7.2", anno); step()
  leader(jx + 19, jy - 19, jx + 236, jy - 152, "JOINT J-04", true, anno); step()
}

// ===== LEVEL 3 — SCALE 1:5 — SECTION A-A (the beam–column joint) =====
function level3(k, art, anno) {
  const { line, poly, pathEl, rectEl, circ, label, hatch, dashed, dimH, dimV, leader, bubble, zigzag, begin, step, THIN } = k
  begin()
  rectEl(240, 300, 1440, 80, { stroke: INK, "stroke-width": 1.5 }, art); hatch(240, 300, 1440, 80, 40, art, { opacity: 0.28 })
  step()
  rectEl(240, 380, 540, 320, { stroke: INK, "stroke-width": 1.5 }, art); hatch(240, 380, 540, 320, 30, art, { opacity: 0.3 })
  rectEl(1140, 380, 540, 320, { stroke: INK, "stroke-width": 1.5 }, art); hatch(1140, 380, 540, 320, 30, art, { opacity: 0.3 })
  step()
  rectEl(780, 120, 360, 960, { stroke: INK, "stroke-width": 1.5 }, art); hatch(780, 120, 360, 960, 30, art, { opacity: 0.3 })
  step()
  for (let i = 0; i < 4; i++) { const bx = 812 + i * 98; line(bx, 176, bx, 1064, { stroke: INK, "stroke-width": 1.4 }, art) }
  step()
  for (let i = 0; i < 15; i++) {
    const yy = 200 + i * 58
    line(800, yy, 1120, yy, { stroke: INK, "stroke-width": 1 }, art)
    line(806, yy + 26, 1114, yy + 26, { stroke: INK, "stroke-width": 0.9, opacity: 0.7 }, art)
  }
  step()
  line(264, 410, 780, 410, { stroke: INK, "stroke-width": 1.4 }, art); line(264, 670, 780, 670, { stroke: INK, "stroke-width": 1.4 }, art)
  line(1140, 410, 1656, 410, { stroke: INK, "stroke-width": 1.4 }, art); line(1140, 670, 1656, 670, { stroke: INK, "stroke-width": 1.4 }, art)
  step()
  for (let i = 0; i < 7; i++) {
    const xx = 290 + i * 72
    line(xx, 404, xx, 676, { stroke: INK, "stroke-width": 0.9, opacity: 0.7 }, art)
    line(xx + 36, 404, xx + 36, 676, { stroke: INK, "stroke-width": 0.9, opacity: 0.7 }, art)
  }
  for (let i = 0; i < 7; i++) {
    const xx = 1190 + i * 72
    line(xx, 404, xx, 676, { stroke: INK, "stroke-width": 0.9, opacity: 0.7 }, art)
    line(xx + 36, 404, xx + 36, 676, { stroke: INK, "stroke-width": 0.9, opacity: 0.7 }, art)
  }
  step()
  line(772, 380, 772, 700, { stroke: INK, "stroke-width": 1 }, art); line(788, 380, 788, 700, { stroke: INK, "stroke-width": 1 }, art)
  line(1132, 380, 1132, 700, { stroke: INK, "stroke-width": 1 }, art); line(1148, 380, 1148, 700, { stroke: INK, "stroke-width": 1 }, art)
  step()
  // FOCUS: the confinement ties in the joint zone
  for (let i = 0; i < 6; i++) { const yy = 392 + i * 52; line(794, yy, 1126, yy, { stroke: ACCENT, "stroke-width": 1.5 }, art) }
  step()
  begin()
  label(64, 80, "SCALE 1:5", {}, anno); label(64, 98, "SECTION A-A", {}, anno); label(64, 116, "JOINT J-04", {}, anno); step()
  line(171, 380, 262, 380, THIN, anno); line(171, 700, 262, 700, THIN, anno); dimV(180, 380, 700, "700", anno); step()
  line(780, 1080, 780, 1132, THIN, anno); line(1140, 1080, 1140, 1132, THIN, anno); dimH(780, 1140, 1140, "500", anno); step()
  label(64, 152, "BEAM 500 × 700", {}, anno); step()
  leader(1114, 204, 1746, 140, "Ø16 @ 150", false, anno); step()
  leader(300, 410, 204, 478, "COVER 40", false, anno); step()
  leader(1126, 392, 1654, 250, "JOINT ZONE — CONFINEMENT", true, anno); step()
}

// ===== LEVEL 4 — SCALE 1:1 — REBAR CAGE =====
function level4(k, art, anno) {
  const { line, poly, pathEl, rectEl, circ, label, hatch, dashed, dimH, dimV, leader, bubble, zigzag, begin, step, THIN } = k
  begin()
  for (let i = 0; i < 4; i++) {
    const x = 580 + i * 280
    line(x, 250, x, 990, { stroke: INK, "stroke-width": 0.7, opacity: 0.45 }, art)
    circ(x, 250, 6, { stroke: INK, "stroke-width": 0.7, opacity: 0.45 }, art)
  }
  step()
  for (let i = 0; i < 4; i++) {
    const x = 440 + i * 280
    if (x !== 1000) {
      line(x, 250, x, 990, { stroke: INK, "stroke-width": 1.4 }, art)
      circ(x, 250, 7, { stroke: INK, "stroke-width": 1.2 }, art)
    }
  }
  step()
  for (let i = 0; i < 9; i++) {
    const y = 300 + i * 82
    rectEl(420, y, 1020, 66, { stroke: INK, "stroke-width": 1.1, rx: 10 }, art)
    line(1436, y + 6, 1396, y - 16, { stroke: INK, "stroke-width": 1.1 }, art)
    line(1396, y - 16, 1434, y - 30, { stroke: INK, "stroke-width": 1.1 }, art)
  }
  step()
  for (let i = 0; i < 4; i++) {
    const x = 440 + i * 280
    for (let j = 0; j < 3; j++) {
      const y = 322 + j * 164
      pathEl("M" + (x - 11) + " " + y + " l7 -7 l7 14 l7 -14 l7 7", { stroke: INK, "stroke-width": 0.8, opacity: 0.65 }, art)
    }
  }
  step()
  rectEl(706, 560, 28, 64, { stroke: INK, "stroke-width": 1.3, fill: INK }, art)
  for (let i = 0; i < 7; i++) line(706, 568 + i * 8, 734, 568 + i * 8, { stroke: PAPER, "stroke-width": 1 }, art)
  step()
  line(566, 300, 566, 700, { stroke: INK, "stroke-width": 1.4 }, art)
  line(594, 620, 594, 990, { stroke: INK, "stroke-width": 1.4 }, art)
  line(566, 660, 594, 660, { stroke: INK, "stroke-width": 0.8, opacity: 0.6 }, art)
  step()
  // FOCUS: one bar end to end, with its standard 90° hook
  pathEl("M1000 990 L1000 300 L1064 300 L1064 350", { stroke: ACCENT, "stroke-width": 1.5 }, art)
  circ(1000, 300, 7, { stroke: ACCENT, "stroke-width": 1.5 }, art)
  step()
  pathEl("M1280 990 L1280 300 L1332 346", { stroke: INK, "stroke-width": 1.4 }, art)
  circ(1280, 300, 7, { stroke: INK, "stroke-width": 1.2 }, art)
  step()
  begin()
  label(64, 80, "SCALE 1:1", {}, anno); label(64, 98, "REBAR CAGE — TYP.", {}, anno); step()
  label(64, 116, "STIRRUP Ø10 @ 150", {}, anno); label(64, 134, "COVER 40", {}, anno); step()
  line(646, 620, 566, 620, THIN, anno); line(646, 700, 566, 700, THIN, anno); dimV(660, 620, 700, "40d LAP", anno); step()
  leader(1064, 350, 1520, 300, "Ø16 — 90° HOOK", true, anno); step()
  leader(1440, 360, 1626, 250, "STIRRUP Ø10 @ 150", false, anno); step()
  leader(1440, 382, 1626, 470, "COVER 40", false, anno); step()
}

// ===== LEVEL 5 — SCALE 1:0.1 — CONCRETE MICROSTRUCTURE =====
function level5(k, art, anno) {
  const { line, poly, pathEl, rectEl, circ, label, hatch, dashed, dimH, dimV, leader, bubble, zigzag, begin, step, THIN } = k
  begin()
  const R = seeded(20260926)
  const grains = [], cols = 8, rows = 6, cw = 1800 / cols, ch = 1080 / rows
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const cx = 60 + cw * (c + 0.5) + (R() - 0.5) * cw * 0.42
      const cy = 60 + ch * (r + 0.5) + (R() - 0.5) * ch * 0.42
      const n = 5 + Math.floor(R() * 3), rad = 46 + R() * 34, pts = []
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + R() * 0.35, rr = rad * (0.62 + R() * 0.5)
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr])
      }
      grains.push(pts)
    }
  for (let i = 0; i < grains.length; i++) {
    if (i === 26) continue
    poly(grains[i].concat([grains[i][0]]), { stroke: INK, "stroke-width": 1, opacity: 0.9 }, art)
  }
  step()
  for (let i = 0; i < 10; i++) circ(110 + R() * 1700, 110 + R() * 980, 7 + R() * 13, { stroke: INK, "stroke-width": 0.9, opacity: 0.7 }, art)
  circ(1600, 300, 17, { stroke: INK, "stroke-width": 0.9, opacity: 0.7 }, art)
  step()
  for (let i = 0; i < 14; i++) {
    const x = 120 + R() * 1660, y = 120 + R() * 960
    circ(x, y, 7, { stroke: INK, "stroke-width": 0.9, opacity: 0.75 }, art)
    circ(x, y, 2, { stroke: INK, "stroke-width": 0.9, opacity: 0.75, fill: INK }, art)
  }
  step()
  for (let i = 0; i < 26; i++) {
    const x = 110 + R() * 1680, y = 110 + R() * 980, a = R() * Math.PI, L = 16 + R() * 18
    line(x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, { stroke: INK, "stroke-width": 0.8, opacity: 0.6 }, art)
  }
  step()
  for (let i = 0; i < 4; i++) {
    const x = 140 + R() * 1560, y = 140 + R() * 880
    for (let k = 0; k < 7; k++) circ(x + (R() - 0.5) * 70, y + (R() - 0.5) * 70, 5, { stroke: INK, "stroke-width": 0.8, opacity: 0.55 }, art)
  }
  for (let k = 0; k < 7; k++) circ(1400 + ((k * 53) % 80) - 40, 900 + ((k * 37) % 70) - 35, 5, { stroke: INK, "stroke-width": 0.8, opacity: 0.55 }, art)
  step()
  rectEl(150, 150, 1620, 900, { stroke: INK, "stroke-width": 0.6, opacity: 0.4 }, art)
  for (const p of [[150, 150], [1770, 150], [150, 1050], [1770, 1050]])
    pathEl("M" + (p[0] - 22) + " " + p[1] + " L" + p[0] + " " + p[1] + " L" + p[0] + " " + (p[1] + (p[1] < 600 ? 22 : -22)), { stroke: INK, "stroke-width": 1, opacity: 0.5 }, art)
  step()
  // FOCUS: one aggregate grain, hatched
  const g = grains[26]
  poly(g.concat([g[0]]), { stroke: ACCENT, "stroke-width": 1.5 }, art)
  let gx = 0, gy = 0
  for (let k = 0; k < g.length; k++) { gx += g[k][0]; gy += g[k][1] }
  gx /= g.length; gy /= g.length
  for (let k = 0; k < 3; k++) line(gx - 26 + k * 22, gy + 28, gx - 6 + k * 22, gy - 28, { stroke: ACCENT, "stroke-width": 1 }, art)
  step()
  begin()
  label(64, 80, "SCALE 1:0.1", {}, anno); label(64, 98, "CONCRETE MICROSTRUCTURE", {}, anno); step()
  label(64, 116, "FIELD OF VIEW 20 MM", {}, anno); step()
  leader(1600, 300, 1730, 208, "CAPILLARY PORE", false, anno); step()
  leader(1400, 900, 1620, 1016, "C-S-H GEL", false, anno); step()
  leader(g[0][0], g[0][1], 250, 1104, "AGGREGATE 20 MM", true, anno); step()
}

export default {
  id: "structure",
  name: "STRUCTURE",
  levels: [
    { scale: "SCALE 1:500", title: "SITE ELEVATION", build: level0 },
    { scale: "SCALE 1:100", title: "TOWER ELEVATION", build: level1 },
    { scale: "SCALE 1:20", title: "TYPICAL FLOOR PLAN — L-14", build: level2 },
    { scale: "SCALE 1:5", title: "SECTION A-A — JOINT J-04", build: level3 },
    { scale: "SCALE 1:1", title: "REBAR CAGE — TYP.", build: level4 },
    { scale: "SCALE 1:0.1", title: "CONCRETE MICROSTRUCTURE", build: level5 }
  ]
}

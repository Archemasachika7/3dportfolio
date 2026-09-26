/**
 * Chapter 02 — DATA. Sample space → one cluster and its regression → one
 * record → its feature vector entering a network → a single neuron → the
 * loss surface it learns on.
 *
 * Same drawing grammar as the structural chapter: one accent per scale,
 * marking the element the camera pushes into, which sits at the frame
 * centre (960, 600).
 */
import { ACCENT, seeded } from "./kit"

const DEG = Math.PI / 180

function gauss(R) {
  let u = 0
  while (!u) u = R()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * R())
}

// ===== LEVEL 0 — SAMPLE SPACE (scatter of the whole dataset) =====
function level0(k, art, anno) {
  const { line, circ, ellipse, label, dashed, leader, begin, step, THIN, ACC } = k
  const R = seeded(7301)
  begin()
  line(200, 1010, 1740, 1010, { "stroke-width": 1.5 }, art)
  line(200, 1010, 200, 150, { "stroke-width": 1.5 }, art)
  step()
  for (let i = 1; i <= 10; i++) line(200 + i * 154, 1010, 200 + i * 154, 1022, THIN, art)
  for (let i = 1; i <= 6; i++) line(188, 1010 - i * 143, 200, 1010 - i * 143, THIN, art)
  step()
  for (let i = 1; i <= 6; i++) dashed(200, 1010 - i * 143, 1740, 1010 - i * 143, 6, 16, { opacity: 0.22 }, art)
  step()
  const clusters = [
    { cx: 470, cy: 780, sx: 105, sy: 62, n: 60, rot: -18 },
    { cx: 690, cy: 350, sx: 88, sy: 74, n: 48, rot: 10 },
    { cx: 1290, cy: 330, sx: 120, sy: 66, n: 55, rot: 14 },
    { cx: 1420, cy: 800, sx: 110, sy: 78, n: 58, rot: -8 },
    { cx: 1610, cy: 540, sx: 64, sy: 56, n: 32, rot: 0 }
  ]
  for (const c of clusters) {
    const cs = Math.cos(c.rot * DEG), sn = Math.sin(c.rot * DEG)
    for (let i = 0; i < c.n; i++) {
      const gx = gauss(R) * c.sx, gy = gauss(R) * c.sy
      circ(c.cx + gx * cs - gy * sn, c.cy + gx * sn + gy * cs, 3.2, { "stroke-width": 1, opacity: 0.85 }, art)
    }
    step()
  }
  for (let i = 0; i < 50; i++) circ(230 + R() * 1480, 180 + R() * 800, 2.6, { "stroke-width": 0.8, opacity: 0.45 }, art)
  step()
  // FOCUS: cluster C-3, dead centre
  const cs = Math.cos(-24 * DEG), sn = Math.sin(-24 * DEG)
  for (let i = 0; i < 64; i++) {
    const gx = gauss(R) * 92, gy = gauss(R) * 48
    circ(960 + gx * cs - gy * sn, 600 + gx * sn + gy * cs, 3.2, { "stroke-width": 1 }, art)
  }
  step()
  ellipse(960, 600, 215, 118, -24, ACC, art)
  line(948, 600, 972, 600, ACC, art)
  line(960, 588, 960, 612, ACC, art)
  step()
  begin()
  label(64, 80, "n = 1 000 000", {}, anno); label(64, 98, "SAMPLE SPACE — K-MEANS, k = 6", {}, anno); step()
  label(214, 168, "X2", {}, anno); label(1740, 1044, "X1", { "text-anchor": "end" }, anno); step()
  for (let i = 0; i <= 10; i += 2) label(200 + i * 154, 1044, String(i * 10), { "text-anchor": "middle", opacity: 0.7 }, anno)
  step()
  leader(1150, 520, 1250, 450, "CLUSTER C-3 — n = 8 412", true, anno); step()
}

// ===== LEVEL 1 — CLUSTER C-3 (points, fit, residuals) =====
function level1(k, art, anno) {
  const { line, circ, label, dashed, leader, begin, step, THIN, ACC } = k
  const R = seeded(1942)
  const slope = Math.tan(-24 * DEG)
  const fit = (x) => 600 + (x - 960) * slope
  begin()
  line(120, 1090, 1800, 1090, { "stroke-width": 1.25 }, art)
  line(120, 1090, 120, 110, { "stroke-width": 1.25 }, art)
  step()
  for (let i = 1; i < 12; i++) line(120 + i * 140, 1090, 120 + i * 140, 1100, THIN, art)
  for (let i = 1; i < 7; i++) line(110, 1090 - i * 140, 120, 1090 - i * 140, THIN, art)
  step()
  const pts = []
  const cs = Math.cos(-24 * DEG), sn = Math.sin(-24 * DEG)
  while (pts.length < 150) {
    const gx = gauss(R) * 470, gy = gauss(R) * 130
    const x = 960 + gx * cs - gy * sn, y = 600 + gx * sn + gy * cs
    if (x < 150 || x > 1780 || y < 130 || y > 1070) continue
    if (Math.hypot(x - 960, y - 600) < 50) continue
    pts.push([x, y])
  }
  pts.forEach(([x, y], i) => {
    circ(x, y, 6, { "stroke-width": 1.1, opacity: 0.85 }, art)
    if (i % 30 === 29) step()
  })
  step()
  line(180, fit(180), 1740, fit(1740), { "stroke-width": 1.6 }, art)
  step()
  dashed(180, fit(180) - 80, 1740, fit(1740) - 80, 12, 10, { opacity: 0.45 }, art)
  dashed(180, fit(180) + 80, 1740, fit(1740) + 80, 12, 10, { opacity: 0.45 }, art)
  step()
  pts.slice(0, 26).forEach(([x, y]) => line(x, y, x, fit(x), { ...THIN, opacity: 0.4 }, art))
  step()
  // FOCUS: one observation
  circ(960, 600, 11, ACC, art)
  line(930, 600, 945, 600, ACC, art); line(975, 600, 990, 600, ACC, art)
  line(960, 570, 960, 585, ACC, art); line(960, 615, 960, 630, ACC, art)
  step()
  begin()
  label(64, 80, "n = 8 412", {}, anno); label(64, 98, "CLUSTER C-3", {}, anno); step()
  label(1560, fit(1560) - 96, "ŷ = 0.82 x + 11.4", {}, anno); step()
  label(1560, fit(1560) + 112, "95% CI", { opacity: 0.8 }, anno); label(150, 136, "R² = 0.91", {}, anno); step()
  leader(990, 585, 1180, 410, "OBS #48 213", true, anno); step()
}

// ===== LEVEL 2 — ONE RECORD (the table the point came from) =====
function level2(k, art, anno) {
  const { line, rectEl, label, leader, dimH, begin, step, THIN, ACC } = k
  const R = seeded(48213)
  const X0 = 360, X1 = 1560, HEAD = 210, Y0 = 270, RH = 60, ROWS = 11
  const cols = [
    ["ID", 150], ["CEMENT", 210], ["WATER", 210], ["W/C", 180], ["AGE D", 190], ["STRENGTH MPA", 260]
  ]
  const xs = [X0]
  cols.forEach(([, w]) => xs.push(xs[xs.length - 1] + w))
  begin()
  rectEl(X0, HEAD, X1 - X0, Y0 + ROWS * RH - HEAD, { "stroke-width": 1.5 }, art); step()
  line(X0, Y0, X1, Y0, { "stroke-width": 1.25 }, art); step()
  for (let i = 1; i < xs.length - 1; i++) line(xs[i], HEAD, xs[i], Y0 + ROWS * RH, THIN, art)
  step()
  for (let r = 1; r < ROWS; r++) line(X0, Y0 + r * RH, X1, Y0 + r * RH, THIN, art)
  step()
  cols.forEach(([name], i) => label(xs[i] + 18, HEAD + 36, name, { "font-size": 13 }, art))
  step()
  const ages = [7, 14, 28, 56, 90]
  for (let r = 0; r < ROWS; r++) {
    const cement = 280 + Math.round(R() * 260), water = 150 + Math.round(R() * 50)
    const wc = water / cement, age = ages[Math.floor(R() * ages.length)]
    const mpa = 18 + (0.62 - wc) * 70 + Math.log(age) * 6 + R() * 4
    const row = [String(48208 + r), String(cement), String(water), wc.toFixed(2), String(age), mpa.toFixed(1)]
    const y = Y0 + r * RH + 38
    row.forEach((v, i) => label(xs[i] + 18, y, v, { "font-size": 13, opacity: r === 5 ? 1 : 0.75 }, art))
    step()
  }
  // FOCUS: record 48 213, row 5 — centred at y = 600
  rectEl(X0 - 6, Y0 + 5 * RH - 3, X1 - X0 + 12, RH + 6, ACC, art); step()
  begin()
  label(64, 80, "1 RECORD", {}, anno); label(64, 98, "MIX_DESIGN.CSV", {}, anno); step()
  label(X0, HEAD - 22, "MIX_DESIGN.CSV — 1 030 ROWS × 9 COLUMNS", {}, anno); step()
  dimH(xs[1], xs[5], Y0 + ROWS * RH + 44, "FEATURES x1 … x8", anno); step()
  dimH(xs[5], xs[6], Y0 + ROWS * RH + 44, "TARGET y", anno); step()
  leader(X1 + 6, 600, 1660, 470, "ROW 48 213", true, anno); step()
}

// ===== LEVEL 3 — FEATURE VECTOR → LAYER 1 =====
function level3(k, art, anno) {
  const { line, rectEl, circ, pathEl, label, leader, begin, step, THIN, ACC } = k
  const vals = ["0.42", "-1.30", "0.07", "0.88", "-0.51", "1.12", "0.26", "-0.94"]
  const inY = vals.map((_, i) => 360 + i * 60)
  const hidY = Array.from({ length: 7 }, (_, j) => 600 + (j - 3) * 95)
  begin()
  // the vector, bracketed
  pathEl("M338 330 h-14 v540 h14", { "stroke-width": 1.5 }, art)
  pathEl("M452 330 h14 v540 h-14", { "stroke-width": 1.5 }, art)
  step()
  vals.forEach((v, i) => label(395, inY[i] + 5, v, { "font-size": 14, "text-anchor": "middle" }, art))
  step()
  inY.forEach((y) => line(470, y, 606, y, THIN, art))
  inY.forEach((y) => circ(620, y, 14, { "stroke-width": 1.2 }, art))
  step()
  hidY.forEach((y, j) => { if (j !== 3) circ(960, y, 20, { "stroke-width": 1.3 }, art) })
  step()
  inY.forEach((yi) => hidY.forEach((yh, j) => { if (j !== 3) line(634, yi, 940, yh, { ...THIN, opacity: 0.3 }, art) }))
  step()
  circ(1320, 600, 26, { "stroke-width": 1.5 }, art)
  hidY.forEach((y) => line(980, y, 1294, 600, { ...THIN, opacity: 0.4 }, art))
  step()
  line(1346, 600, 1520, 600, { "stroke-width": 1.25 }, art)
  pathEl("M1510 594 L1520 600 L1510 606", { "stroke-width": 1 }, art)
  step()
  // FOCUS: unit h3 and its incoming weights
  inY.forEach((yi) => line(634, yi, 940, 600, { stroke: ACCENT, "stroke-width": 0.9, opacity: 0.85 }, art))
  circ(960, 600, 20, ACC, art)
  step()
  begin()
  label(64, 80, "x ∈ ℝ8", {}, anno); label(64, 98, "FEATURE VECTOR → LAYER 1", {}, anno); step()
  label(395, 306, "x", { "text-anchor": "middle", "font-size": 14 }, anno); step()
  label(960, 250, "LAYER 1 — 7 UNITS, RELU", { "text-anchor": "middle" }, anno); step()
  label(1320, 560, "ŷ", { "text-anchor": "middle", "font-size": 14 }, anno)
  label(1540, 604, "ŷ = 41.7 MPA", {}, anno); step()
  leader(978, 588, 1120, 420, "UNIT H-3", true, anno); step()
}

// ===== LEVEL 4 — ONE NEURON =====
function level4(k, art, anno) {
  const { line, circ, pathEl, label, leader, dashed, begin, step, THIN, ACC } = k
  const sig = (x) => 1 / (1 + Math.exp(-x))
  const ins = [300, 420, 540, 660, 780, 900]
  const ws = ["0.82", "-0.47", "1.05", "0.13", "-0.66", "0.39"]
  begin()
  circ(960, 600, 150, { "stroke-width": 1.6 }, art); step()
  ins.forEach((y) => circ(260, y, 12, { "stroke-width": 1.2 }, art)); step()
  ins.forEach((y) => {
    const a = Math.atan2(y - 600, 260 - 960)
    line(272, y, 960 + 150 * Math.cos(a), 600 + 150 * Math.sin(a), { "stroke-width": 1.1 }, art)
  })
  step()
  line(960, 190, 960, 450, { "stroke-width": 1.1 }, art); circ(960, 178, 12, { "stroke-width": 1.2 }, art); step()
  line(1110, 600, 1270, 600, { "stroke-width": 1.25 }, art)
  pathEl("M1260 594 L1270 600 L1260 606", { "stroke-width": 1 }, art)
  step()
  // activation plot
  line(1300, 780, 1730, 780, { "stroke-width": 1.2 }, art)
  line(1515, 800, 1515, 400, { "stroke-width": 1.2 }, art)
  step()
  dashed(1300, 420, 1730, 420, 6, 10, { opacity: 0.35 }, art)
  dashed(1300, 600, 1730, 600, 6, 10, { opacity: 0.35 }, art)
  step()
  const curve = []
  for (let i = 0; i <= 60; i++) {
    const x = -6 + (12 * i) / 60
    curve.push([1300 + ((x + 6) / 12) * 430, 780 - sig(x) * 360])
  }
  pathEl("M" + curve.map((p) => p.join(" ")).join(" L"), { "stroke-width": 1.6 }, art)
  circ(1300 + ((1.1 + 6) / 12) * 430, 780 - sig(1.1) * 360, 6, { "stroke-width": 1.3 }, art)
  step()
  // FOCUS: the weighted sum
  pathEl("M1004 548 H920 L968 600 L920 652 H1004", { stroke: ACCENT, "stroke-width": 2.2 }, art)
  circ(960, 600, 62, { stroke: ACCENT, "stroke-width": 1 }, art)
  step()
  begin()
  label(64, 80, "1 UNIT", {}, anno); label(64, 98, "NEURON H-3", {}, anno); step()
  ins.forEach((y, i) => label(236, y + 4, "x" + (i + 1), { "text-anchor": "end" }, anno))
  step()
  ins.forEach((y, i) => {
    const mx = (272 + 820) / 2, my = (y + 600) / 2
    label(mx, my - 8, "w" + (i + 1) + " = " + ws[i], { "text-anchor": "middle", opacity: 0.85 }, anno)
  })
  step()
  label(984, 184, "b = -0.31", {}, anno); step()
  label(1515, 380, "σ(z) — SIGMOID", { "text-anchor": "middle" }, anno); step()
  label(960, 800, "a = σ(Σ wᵢxᵢ + b)", { "text-anchor": "middle", "font-size": 13 }, anno); step()
  leader(1010, 555, 1150, 330, "WEIGHTED SUM", true, anno); step()
}

// ===== LEVEL 5 — LOSS SURFACE (gradient descent) =====
function level5(k, art, anno) {
  const { line, circ, poly, label, leader, arrow, begin, step, THIN, ACC } = k
  const MX = 1010, MY = 630, rot = -20 * DEG
  begin()
  for (let i = 0; i < 10; i++) {
    const r = 55 + i * 78, pts = []
    for (let s = 0; s <= 72; s++) {
      const a = (s / 72) * Math.PI * 2
      const d = r * (1 + 0.1 * Math.sin(3 * a + i * 0.5))
      const x = d * 1.55 * Math.cos(a), y = d * 0.82 * Math.sin(a)
      pts.push([MX + x * Math.cos(rot) - y * Math.sin(rot), MY + x * Math.sin(rot) + y * Math.cos(rot)])
    }
    poly(pts, { "stroke-width": i % 3 === 0 ? 1.2 : 0.8, opacity: 0.75 - i * 0.04 }, art)
    step()
  }
  arrow(150, 1100, 380, 1100, THIN, art); arrow(150, 1100, 150, 870, THIN, art); step()
  // descent path, zig-zagging down the valley
  const path = [[330, 240]]
  for (let n = 1; n < 16; n++) {
    const [px, py] = path[n - 1]
    const dx = MX - px, dy = MY - py, len = Math.hypot(dx, dy) || 1
    const osc = 70 * Math.pow(0.78, n) * (n % 2 ? 1 : -1)
    path.push([px + dx * 0.3 - (dy / len) * osc, py + dy * 0.3 + (dx / len) * osc])
  }
  path.push([MX, MY])
  path.slice(0, -1).forEach(([x, y]) => circ(x, y, 5, { "stroke-width": 1 }, art))
  step()
  // FOCUS: the path settling into the minimum
  poly(path, { stroke: ACCENT, "stroke-width": 1.4 }, art)
  circ(MX, MY, 12, ACC, art)
  line(MX - 22, MY, MX + 22, MY, ACC, art); line(MX, MY - 22, MX, MY + 22, ACC, art)
  step()
  begin()
  label(64, 80, "∇L → 0", {}, anno); label(64, 98, "LOSS SURFACE L(w1, w2)", {}, anno); step()
  label(392, 1104, "W1", {}, anno); label(158, 858, "W2", {}, anno); step()
  label(344, 222, "EPOCH 0 — L = 2.41", {}, anno); step()
  label(64, 116, "η = 0.01 — EPOCH 40", {}, anno); step()
  leader(MX + 12, MY - 12, 1260, 470, "MINIMUM — L = 0.037", true, anno); step()
}

export default {
  id: "data",
  name: "DATA",
  levels: [
    { scale: "n = 1 000 000", title: "SAMPLE SPACE", build: level0 },
    { scale: "n = 8 412", title: "CLUSTER C-3 — REGRESSION", build: level1 },
    { scale: "1 RECORD", title: "MIX_DESIGN.CSV — ROW 48 213", build: level2 },
    { scale: "x ∈ ℝ8", title: "FEATURE VECTOR → LAYER 1", build: level3 },
    { scale: "1 UNIT", title: "NEURON H-3", build: level4 },
    { scale: "∇L → 0", title: "LOSS SURFACE — GRADIENT DESCENT", build: level5 }
  ]
}


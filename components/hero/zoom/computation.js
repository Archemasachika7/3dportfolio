/**
 * Chapter 03 — COMPUTATION. System architecture → one service → one
 * function's control flow → its machine instructions → the logic that
 * executes them → a single transistor.
 *
 * Same drawing grammar as the other chapters: one accent per scale,
 * marking the element the camera pushes into at the frame centre.
 */
import { ACCENT, PAPER, seeded } from "./kit"

// Rounded-corner box as a path (so it draws on like everything else).
function box(k, x, y, w, h, r, a, p) {
  const d =
    `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} ` +
    `Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} ` +
    `V${y + r} Q${x} ${y} ${x + r} ${y} Z`
  return k.pathEl(d, a, p)
}

// ===== LEVEL 0 — SYSTEM ARCHITECTURE =====
function level0(k, art, anno) {
  const { line, rectEl, pathEl, ellipse, label, dashed, arrow, leader, begin, step, THIN, ACC } = k
  begin()
  // clients
  const clientY = [330, 600, 870]
  clientY.forEach((y) => {
    rectEl(150, y - 50, 150, 96, { "stroke-width": 1.3 }, art)
    line(225, y + 46, 225, y + 64, THIN, art)
    line(195, y + 64, 255, y + 64, { "stroke-width": 1.1 }, art)
  })
  step()
  // load balancer
  rectEl(470, 480, 110, 240, { "stroke-width": 1.4 }, art)
  for (let i = 1; i < 4; i++) line(470, 480 + i * 60, 580, 480 + i * 60, THIN, art)
  step()
  clientY.forEach((y) => arrow(300, y, 468, 600 + (y - 600) * 0.3, { "stroke-width": 1 }, art))
  step()
  // service mesh boundary
  dashed(620, 280, 1300, 280, 14, 10, {}, art)
  dashed(1300, 280, 1300, 920, 14, 10, {}, art)
  dashed(1300, 920, 620, 920, 14, 10, {}, art)
  dashed(620, 920, 620, 280, 14, 10, {}, art)
  step()
  const cx = [740, 960, 1180], cy = [380, 600, 820]
  const names = [["AUTH", "API GW", "SEARCH"], ["QUEUE", "SOLVER", "RENDER"], ["BILLING", "NOTIFY", "METRICS"]]
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (r === 1 && c === 1) continue
      box(k, cx[c] - 85, cy[r] - 55, 170, 110, 8, { "stroke-width": 1.25 }, art)
    }
    step()
  }
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) line(cx[c] + 85, cy[r], cx[c + 1] - 85, cy[r], { ...THIN, opacity: 0.45 }, art)
  for (let c = 0; c < 3; c++) for (let r = 0; r < 2; r++) line(cx[c], cy[r] + 55, cx[c], cy[r + 1] - 55, { ...THIN, opacity: 0.45 }, art)
  step()
  cy.forEach((y) => arrow(580, 600 + (y - 600) * 0.3, 652, y, { "stroke-width": 1 }, art))
  step()
  // data stores
  const dbY = [360, 600, 840]
  dbY.forEach((y) => {
    ellipse(1580, y - 52, 90, 20, 0, { "stroke-width": 1.25 }, art)
    line(1490, y - 52, 1490, y + 52, { "stroke-width": 1.25 }, art)
    line(1670, y - 52, 1670, y + 52, { "stroke-width": 1.25 }, art)
    pathEl(`M1490 ${y + 52} A90 20 0 0 0 1670 ${y + 52}`, { "stroke-width": 1.25 }, art)
  })
  step()
  dbY.forEach((y) => arrow(1300, y, 1486, y, { "stroke-width": 1 }, art))
  step()
  // FOCUS: the solver service
  box(k, 875, 545, 170, 110, 8, ACC, art)
  line(875, 575, 1045, 575, { stroke: ACCENT, "stroke-width": 1 }, art)
  step()
  begin()
  label(64, 80, "1 REGION", {}, anno); label(64, 98, "SYSTEM ARCHITECTURE", {}, anno); step()
  ;["WEB", "MOBILE", "API CLIENT"].forEach((t, i) => label(225, clientY[i] - 64, t, { "text-anchor": "middle" }, anno))
  label(525, 462, "LB", { "text-anchor": "middle" }, anno); step()
  names.forEach((row, r) => row.forEach((t, c) => label(cx[c], cy[r] + 4, t, { "text-anchor": "middle", fill: r === 1 && c === 1 ? ACCENT : undefined }, anno)))
  step()
  label(636, 266, "SERVICE MESH", {}, anno); step()
  ;["POSTGRES", "OBJECT STORE", "CACHE"].forEach((t, i) => label(1580, dbY[i] + 90, t, { "text-anchor": "middle" }, anno))
  step()
  label(1300, 960, "REGION AP-SOUTH-1 — 99.95% SLA", { "text-anchor": "end" }, anno); step()
}

// ===== LEVEL 1 — ONE SERVICE =====
function level1(k, art, anno) {
  const { line, rectEl, label, arrow, leader, hatch, begin, step, THIN, ACC } = k
  begin()
  box(k, 280, 170, 1360, 860, 14, { "stroke-width": 1.6 }, art); step()
  line(280, 225, 1640, 225, { "stroke-width": 1 }, art); step()
  // ports on the container edge
  rectEl(268, 588, 24, 24, { "stroke-width": 1.2, fill: PAPER }, art)
  rectEl(1628, 588, 24, 24, { "stroke-width": 1.2, fill: PAPER }, art)
  step()
  box(k, 780, 270, 360, 90, 8, { "stroke-width": 1.3 }, art) // HTTP API
  step()
  rectEl(400, 450, 240, 300, { "stroke-width": 1.3 }, art) // job queue
  for (let i = 1; i < 6; i++) line(412, 450 + i * 50, 628, 450 + i * 50, THIN, art)
  step()
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) box(k, 1290 + c * 130, 470 + r * 150, 110, 110, 6, { "stroke-width": 1.2 }, art) // workers
  step()
  box(k, 810, 840, 300, 90, 8, { "stroke-width": 1.3 }, art) // cache
  hatch(812, 842, 296, 86, 18, art, { opacity: 0.25 })
  step()
  arrow(960, 360, 960, 496, { "stroke-width": 1.1 }, art)
  arrow(640, 600, 806, 600, { "stroke-width": 1.1 }, art)
  arrow(1114, 600, 1284, 600, { "stroke-width": 1.1 }, art)
  arrow(960, 704, 960, 836, { "stroke-width": 1.1 }, art)
  arrow(292, 600, 396, 600, { "stroke-width": 1.1 }, art)
  step()
  // FOCUS: the FEM core module
  box(k, 810, 500, 300, 200, 10, ACC, art)
  line(810, 540, 1110, 540, { stroke: ACCENT, "stroke-width": 1 }, art)
  step()
  begin()
  label(64, 80, "1 SERVICE", {}, anno); label(64, 98, "SOLVER-SVC", {}, anno); step()
  label(300, 204, "SOLVER-SVC  V2.4.1", {}, anno); label(1620, 204, "REPLICAS × 3", { "text-anchor": "end" }, anno); step()
  label(960, 322, "HTTP API", { "text-anchor": "middle" }, anno)
  label(520, 436, "JOB QUEUE", { "text-anchor": "middle" }, anno)
  label(1405, 452, "WORKER POOL", { "text-anchor": "middle" }, anno)
  label(960, 892, "RESULT CACHE", { "text-anchor": "middle" }, anno)
  step()
  label(972, 440, "GRPC", {}, anno); label(250, 580, "PORT 8443", { "text-anchor": "end" }, anno); step()
  label(960, 526, "FEM-CORE", { "text-anchor": "middle", fill: ACCENT }, anno); step()
  leader(1110, 690, 1240, 800, "SOLVER CORE", true, anno); step()
}

// ===== LEVEL 2 — ONE FUNCTION (control flow) =====
function level2(k, art, anno) {
  const { line, poly, pathEl, ellipse, label, arrow, begin, step, ACC } = k
  begin()
  ellipse(200, 600, 74, 40, 0, { "stroke-width": 1.4 }, art); step()
  box(k, 400, 555, 200, 90, 6, { "stroke-width": 1.3 }, art); step()
  box(k, 1230, 555, 220, 90, 6, { "stroke-width": 1.3 }, art); step()
  pathEl("M1680 540 L1760 600 L1680 660 L1600 600 Z", { "stroke-width": 1.4 }, art); step()
  box(k, 1570, 860, 220, 84, 6, { "stroke-width": 1.3 }, art); step()
  arrow(274, 600, 396, 600, { "stroke-width": 1.1 }, art)
  arrow(600, 600, 836, 600, { "stroke-width": 1.1 }, art)
  arrow(1084, 600, 1226, 600, { "stroke-width": 1.1 }, art)
  arrow(1450, 600, 1596, 600, { "stroke-width": 1.1 }, art)
  step()
  poly([[1680, 540], [1680, 340], [960, 340], [960, 540]], { "stroke-width": 1.1 }, art)
  pathEl("M954 530 L960 540 L966 530", { "stroke-width": 1 }, art)
  step()
  arrow(1680, 660, 1680, 856, { "stroke-width": 1.1 }, art); step()
  // FOCUS: assemble K
  box(k, 840, 545, 240, 110, 8, ACC, art); step()
  begin()
  label(64, 80, "1 FUNCTION", {}, anno); label(64, 98, "FEM-CORE — CONTROL FLOW", {}, anno); step()
  label(200, 604, "START", { "text-anchor": "middle" }, anno)
  label(500, 604, "LOAD MESH", { "text-anchor": "middle" }, anno)
  label(1340, 604, "SOLVE Ku = f", { "text-anchor": "middle" }, anno)
  label(1680, 604, "CONVERGED?", { "text-anchor": "middle", "font-size": 9 }, anno)
  label(1680, 906, "WRITE RESULTS", { "text-anchor": "middle" }, anno)
  step()
  label(960, 604, "ASSEMBLE K", { "text-anchor": "middle", fill: ACCENT, "font-size": 12 }, anno); step()
  label(1300, 330, "NO — REFINE", {}, anno); label(1696, 760, "YES", {}, anno); step()
  label(960, 700, "for e in elements:", { "text-anchor": "middle", opacity: 0.8 }, anno)
  label(960, 718, "K += Bᵀ D B |J| w", { "text-anchor": "middle", opacity: 0.8 }, anno)
  step()
  label(200, 1000, "fn solve(mesh) → u — ITERATION 3 / 12", {}, anno); step()
}

// ===== LEVEL 3 — MACHINE INSTRUCTIONS =====
function level3(k, art, anno) {
  const { line, rectEl, pathEl, label, leader, begin, step, THIN, ACC } = k
  const R = seeded(4096)
  const code = [
    ["PUSH", "RBP"], ["MOV", "RBP, RSP"], ["XOR", "EAX, EAX"], ["VMOVUPD", "YMM0, [RDI]"],
    ["VMOVUPD", "YMM1, [RSI+RAX*8]"], ["VBROADCASTSD", "YMM2, [RDX]"], ["LEA", "RCX, [RAX*8]"],
    ["VFMADD231PD", "YMM3, YMM1, YMM2"], ["ADD", "RAX, 4"], ["CMP", "RAX, R8"], ["JL", ".LOOP"],
    ["VMOVUPD", "[RDI], YMM3"], ["VZEROUPPER", ""], ["POP", "RBP"], ["RET", ""]
  ]
  const y = (i) => 240 + i * 52
  begin()
  rectEl(360, 200, 940, 800, { "stroke-width": 1.5 }, art); step()
  line(530, 200, 530, 1000, THIN, art); step()
  code.forEach(([op, args], i) => {
    const addr = "0x" + (0x4f10 + i * 4).toString(16).toUpperCase()
    const focus = i === 7
    label(390, y(i) + 5, addr, { "font-size": 13, opacity: 0.6 }, art)
    label(560, y(i) + 5, op, { "font-size": 14, fill: focus ? ACCENT : undefined }, art)
    label(800, y(i) + 5, args, { "font-size": 14, opacity: focus ? 1 : 0.8 }, art)
    if (i % 3 === 2) step()
  })
  step()
  // loop back-edge, JL → line 3
  pathEl(`M352 ${y(10)} H320 V${y(3)} H352`, { "stroke-width": 1.1 }, art)
  pathEl(`M344 ${y(3) - 5} L352 ${y(3)} L344 ${y(3) + 5}`, { "stroke-width": 1 }, art)
  step()
  // register file
  rectEl(1380, 300, 340, 600, { "stroke-width": 1.3 }, art)
  line(1380, 350, 1720, 350, { "stroke-width": 1 }, art)
  for (let r = 1; r < 8; r++) line(1380, 350 + r * 68.75, 1720, 350 + r * 68.75, THIN, art)
  step()
  for (let r = 0; r < 8; r++) {
    const hex = Array.from({ length: 4 }, () => Math.floor(R() * 65536).toString(16).toUpperCase().padStart(4, "0")).join(" ")
    label(1400, 350 + r * 68.75 + 40, "YMM" + r, { "font-size": 12, opacity: 0.7 }, art)
    label(1480, 350 + r * 68.75 + 40, hex, { "font-size": 12, fill: r === 3 ? ACCENT : undefined }, art)
  }
  step()
  // FOCUS: the fused multiply-add
  rectEl(372, y(7) - 20, 916, 40, ACC, art); step()
  begin()
  label(64, 80, "1 INSTRUCTION", {}, anno); label(64, 98, "MACHINE CODE", {}, anno); step()
  label(360, 182, "ASSEMBLE_K — X86-64 / AVX2", {}, anno); label(1380, 282, "REGISTERS", {}, anno); step()
  label(300, (y(3) + y(10)) / 2, "LOOP", { "text-anchor": "end" }, anno); step()
  label(1300, 1030, "CYCLE 1 024 — 4 DOUBLES / INSTRUCTION", { "text-anchor": "end" }, anno); step()
  leader(1288, y(7), 1340, 170, "FUSED MULTIPLY-ADD", true, anno); step()
}

// ===== LEVEL 4 — LOGIC (1-bit full adder) =====
function level4(k, art, anno) {
  const { line, circ, pathEl, rectEl, label, leader, begin, step, THIN, ACC } = k
  const orShape = (x, y) =>
    `M${x - 60} ${y - 45} Q${x - 35} ${y} ${x - 60} ${y + 45} Q${x + 20} ${y + 45} ${x + 60} ${y} Q${x + 20} ${y - 45} ${x - 60} ${y - 45} Z`
  const xorBack = (x, y) => `M${x - 74} ${y - 45} Q${x - 49} ${y} ${x - 74} ${y + 45}`
  const andShape = (x, y) => `M${x - 60} ${y - 45} H${x} A45 45 0 0 1 ${x} ${y + 45} H${x - 60} Z`
  const W = { "stroke-width": 1.2 }
  const dot = (x, y) => circ(x, y, 4, { "stroke-width": 1, fill: "currentColor" }, art)
  begin()
  // inputs
  ;[578, 622, 990].forEach((y) => circ(250, y, 9, W, art))
  step()
  // wires
  line(259, 578, 910, 578, W, art); line(259, 622, 910, 622, W, art)
  line(380, 578, 380, 858, W, art); line(380, 858, 905, 858, W, art)
  line(420, 622, 420, 902, W, art); line(420, 902, 905, 902, W, art)
  step()
  line(259, 990, 1180, 990, W, art); line(1180, 990, 1180, 662, W, art); line(1180, 662, 1330, 662, W, art)
  line(1180, 822, 1325, 822, W, art)
  step()
  line(1020, 600, 1100, 600, W, art); line(1100, 600, 1100, 618, W, art); line(1100, 618, 1330, 618, W, art)
  line(1100, 618, 1100, 778, W, art); line(1100, 778, 1325, 778, W, art)
  step()
  // gates
  pathEl(orShape(1380, 640), { "stroke-width": 1.4 }, art); pathEl(xorBack(1380, 640), { "stroke-width": 1.4 }, art)
  pathEl(andShape(960, 880), { "stroke-width": 1.4 }, art)
  pathEl(andShape(1380, 800), { "stroke-width": 1.4 }, art)
  pathEl(orShape(1610, 850), { "stroke-width": 1.4 }, art)
  step()
  line(1440, 640, 1760, 640, W, art)
  line(1005, 880, 1520, 880, W, art); line(1520, 880, 1520, 872, W, art); line(1520, 872, 1560, 872, W, art)
  line(1425, 800, 1480, 800, W, art); line(1480, 800, 1480, 828, W, art); line(1480, 828, 1560, 828, W, art)
  line(1670, 850, 1760, 850, W, art)
  step()
  ;[[380, 578], [420, 622], [1100, 618], [1180, 822]].forEach(([x, y]) => dot(x, y))
  circ(1768, 640, 8, W, art); circ(1768, 850, 8, W, art)
  step()
  // truth table
  rectEl(1360, 150, 400, 250, { "stroke-width": 1 }, art)
  line(1360, 180, 1760, 180, THIN, art)
  step()
  // FOCUS: XOR U1
  pathEl(orShape(960, 600), ACC, art); pathEl(xorBack(960, 600), ACC, art)
  step()
  begin()
  label(64, 80, "1 BIT", {}, anno); label(64, 98, "1-BIT FULL ADDER", {}, anno); step()
  label(228, 582, "A", { "text-anchor": "end", "font-size": 13 }, anno)
  label(228, 626, "B", { "text-anchor": "end", "font-size": 13 }, anno)
  label(228, 994, "CIN", { "text-anchor": "end", "font-size": 13 }, anno)
  label(1784, 644, "S", { "font-size": 13 }, anno); label(1784, 854, "COUT", { "font-size": 13 }, anno)
  step()
  const rows = ["A B C | S CO", "0 0 0 | 0 0", "0 0 1 | 1 0", "0 1 0 | 1 0", "0 1 1 | 0 1", "1 0 0 | 1 0", "1 0 1 | 0 1", "1 1 0 | 0 1", "1 1 1 | 1 1"]
  rows.forEach((r, i) => label(1380, 172 + i * 26, r, { "font-size": 12, opacity: i === 0 ? 0.6 : 0.85 }, anno))
  step()
  label(700, 1080, "S = A ⊕ B ⊕ CIN  —  COUT = AB + CIN(A ⊕ B)", { "font-size": 12 }, anno); step()
  leader(1000, 560, 1100, 420, "XOR — U1", true, anno); step()
}

// ===== LEVEL 5 — TRANSISTOR (CMOS cross-section) =====
function level5(k, art, anno) {
  const { line, rectEl, circ, label, leader, hatch, dashed, dimH, begin, step, THIN, ACC } = k
  begin()
  rectEl(260, 640, 1400, 420, { "stroke-width": 1.5 }, art); step()
  for (let y = 700; y < 1040; y += 56) for (let x = 300; x < 1640; x += 56) circ(x, y, 2.6, { "stroke-width": 0.8, opacity: 0.5 }, art)
  step()
  box(k, 380, 640, 380, 160, 40, { "stroke-width": 1.4 }, art)
  box(k, 1160, 640, 380, 160, 40, { "stroke-width": 1.4 }, art)
  hatch(392, 648, 356, 140, 22, art, { opacity: 0.35 })
  hatch(1172, 648, 356, 140, 22, art, { opacity: 0.35 })
  step()
  rectEl(760, 612, 400, 28, { "stroke-width": 1.2 }, art)
  hatch(760, 612, 400, 28, 8, art, { opacity: 0.5 }, -45)
  step()
  // contacts and metal
  line(570, 640, 570, 300, { "stroke-width": 1.4 }, art)
  line(1350, 640, 1350, 300, { "stroke-width": 1.4 }, art)
  line(960, 470, 960, 300, { "stroke-width": 1.4 }, art)
  step()
  ;[570, 960, 1350].forEach((x) => rectEl(x - 70, 240, 140, 60, { "stroke-width": 1.3 }, art))
  step()
  // channel with carriers
  dashed(770, 660, 1150, 660, 10, 8, { opacity: 0.8 }, art)
  for (let i = 0; i < 9; i++) circ(790 + i * 42, 676, 5, { "stroke-width": 0.9 }, art)
  step()
  // FOCUS: the gate electrode
  rectEl(800, 470, 320, 142, ACC, art)
  hatch(800, 470, 320, 142, 26, art, { stroke: ACCENT, opacity: 0.45 })
  step()
  begin()
  label(64, 80, "3 NM", {}, anno); label(64, 98, "TRANSISTOR — CMOS GATE", {}, anno); step()
  label(570, 276, "S", { "text-anchor": "middle", "font-size": 13 }, anno)
  label(960, 276, "G", { "text-anchor": "middle", "font-size": 13 }, anno)
  label(1350, 276, "D", { "text-anchor": "middle", "font-size": 13 }, anno)
  step()
  label(570, 740, "n+ SOURCE", { "text-anchor": "middle" }, anno)
  label(1350, 740, "n+ DRAIN", { "text-anchor": "middle" }, anno)
  label(960, 1010, "p-SUBSTRATE — SI LATTICE", { "text-anchor": "middle" }, anno)
  step()
  dimH(800, 1120, 430, "GATE LENGTH 3 NM", anno); step()
  leader(1160, 626, 1300, 560, "HIGH-K OXIDE", false, anno); step()
  label(960, 710, "CHANNEL — V_GS > V_TH", { "text-anchor": "middle", opacity: 0.85 }, anno); step()
  leader(1120, 490, 1260, 380, "GATE", true, anno); step()
}

export default {
  id: "computation",
  name: "COMPUTATION",
  levels: [
    { scale: "1 REGION", title: "SYSTEM ARCHITECTURE", build: level0 },
    { scale: "1 SERVICE", title: "SOLVER SERVICE — INTERNALS", build: level1 },
    { scale: "1 FUNCTION", title: "FEM-CORE — CONTROL FLOW", build: level2 },
    { scale: "1 INSTRUCTION", title: "MACHINE CODE — X86-64 AVX2", build: level3 },
    { scale: "1 BIT", title: "LOGIC — FULL ADDER", build: level4 },
    { scale: "3 NM", title: "TRANSISTOR — CMOS GATE", build: level5 }
  ]
}

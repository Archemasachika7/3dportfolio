/**
 * Structured content for the homepage motion system.
 * Components read this data and decide how to animate it — no animation
 * is hard-coded per project or per node (see `motionType`).
 */

export const identity = {
  name: "ARCHISHMAN DAS",
  descriptor: "ENGINEER × DATA × COMPUTATION × BUSINESS",
  systemTag: "SYSTEM / 001",
  fileTag: "ARCHISHMAN DAS / PORTFOLIO"
}

export const education = [
  {
    id: "school",
    label: "SCHOOL",
    institution: "SECONDARY & HIGHER SECONDARY",
    discipline: "ACADEMICS",
    year: "— 2022"
  },
  {
    id: "jadavpur",
    label: "JADAVPUR UNIVERSITY",
    institution: "JADAVPUR UNIVERSITY",
    discipline: "CIVIL ENGINEERING",
    year: "2022 — PRESENT",
    metrics: [{ label: "CGPA", value: "8.X" }]
  },
  {
    id: "iitm",
    label: "IIT MADRAS",
    institution: "IIT MADRAS",
    discipline: "BS DATA SCIENCE",
    year: "2023 — PRESENT",
    metrics: [{ label: "PROGRAMME", value: "BS" }]
  }
]

export const branches = [
  {
    id: "engineering",
    label: "ENGINEERING",
    summary: "Structural systems, seismic design, computational modelling."
  },
  {
    id: "data",
    label: "DATA + AI",
    summary: "Statistical modelling, machine learning, applied inference."
  },
  {
    id: "business",
    label: "BUSINESS + ANALYTICS",
    summary: "Decision systems, optimisation, market and operations analysis."
  },
  {
    id: "leadership",
    label: "LEADERSHIP / ENTREPRENEURSHIP",
    summary: "Building and running teams, ventures, and student organisations."
  }
]

export const thinkingSteps = ["PROBLEM", "MODEL", "COMPUTE", "VALIDATE", "DECIDE"]

export const projects = [
  {
    id: "seismic-tower",
    title: "25-STOREY RCC SEISMIC TOWER",
    domain: "engineering",
    year: "2025",
    tags: ["ETABS", "PYTHON", "IS 1893", "IS 456", "API AUTOMATION"],
    summary:
      "Automated structural analysis pipeline for a high-rise RCC tower under seismic loading, driving ETABS through a Python API layer.",
    motionType: "structural",
    diagram: ["GRID", "COLUMNS", "BEAMS", "LOADS", "ANALYSIS", "DRIFT", "OPTIMISATION", "RESULT"],
    featured: true
  },
  {
    id: "demand-forecasting",
    title: "DEMAND FORECASTING PIPELINE",
    domain: "data",
    year: "2025",
    tags: ["PYTHON", "PANDAS", "SCIKIT-LEARN", "TIME SERIES"],
    summary:
      "End-to-end forecasting pipeline turning raw transaction logs into validated demand signals for planning.",
    motionType: "data-flow",
    diagram: ["DATA", "CLEAN", "TRANSFORM", "MODEL", "VALIDATE", "INSIGHT"],
    featured: true
  },
  {
    id: "ops-optimisation",
    title: "OPERATIONS COST OPTIMISATION",
    domain: "business",
    year: "2024",
    tags: ["LINEAR PROGRAMMING", "EXCEL MODEL", "SENSITIVITY ANALYSIS"],
    summary:
      "Constraint-based optimisation model reducing allocation cost across a multi-site operation.",
    motionType: "diagram",
    diagram: ["CONSTRAINTS", "VARIABLES", "OBJECTIVE", "SOLVE", "SENSITIVITY", "DECISION"],
    featured: true
  },
  {
    id: "student-venture",
    title: "STUDENT VENTURE — TEAM OF TWELVE",
    domain: "leadership",
    year: "2023 — PRESENT",
    tags: ["STRATEGY", "OPERATIONS", "HIRING", "GOVERNANCE"],
    summary:
      "Founded and ran a twelve-person student organisation, from strategy through day-to-day operations.",
    motionType: "editorial",
    diagram: ["VISION", "TEAM", "PROCESS", "EXECUTION", "REVIEW"],
    featured: true
  }
]

export const closingStatement = ["BUILD", "ANALYSE", "OPTIMISE"]

export const closingLinks = [
  { label: "RESUME", href: "/resume" },
  { label: "GITHUB", href: "#" },
  { label: "LINKEDIN", href: "#" },
  { label: "CONTACT", href: "mailto:beingthebestarche@gmail.com" }
]

/**
 * Presentational-only constants for the homepage motion system —
 * fallback identity strings, methodology labels, and closing links.
 * Career facts (education, projects, domains, achievements) are no
 * longer sourced here; they come from Supabase (see lib/queries.js).
 * The old hard-coded education/branches/projects arrays that used to
 * live in this file were legacy/demo content and have been removed.
 */

export const identity = {
  name: "ARCHISHMAN DAS",
  descriptor: "ENGINEER × DATA × COMPUTATION × BUSINESS",
  systemTag: "SYSTEM / 001",
  fileTag: "ARCHISHMAN DAS / PORTFOLIO"
}

export const thinkingSteps = ["PROBLEM", "MODEL", "COMPUTE", "VALIDATE", "DECIDE"]

export const closingStatement = ["BUILD", "ANALYSE", "OPTIMISE", "IMPACT"]

export const closingLinks = [
  { label: "RESUME", href: "/resume" },
  { label: "GITHUB", href: "#" },
  { label: "LINKEDIN", href: "#" },
  { label: "CONTACT", href: "mailto:beingthebestarche@gmail.com" }
]

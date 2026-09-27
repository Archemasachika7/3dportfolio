/**
 * Copies the PDF.js worker into public/pdfjs, where the resume viewer loads
 * it from /pdfjs/. Copied on install (like the CAD WASM) so it always
 * matches the installed pdfjs-dist version.
 */
import { copyFile, mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const source = join(root, "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.min.mjs")
const targetDir = join(root, "public", "pdfjs")

if (!existsSync(source)) {
  // Not fatal: the viewer falls back to opening the PDF directly.
  console.warn("[copy-pdf-worker] pdfjs-dist worker not found — resume pages will link to the PDF instead.")
  process.exit(0)
}

await mkdir(targetDir, { recursive: true })
await copyFile(source, join(targetDir, "pdf.worker.min.mjs"))
console.log("[copy-pdf-worker] PDF.js worker ready at public/pdfjs/pdf.worker.min.mjs")

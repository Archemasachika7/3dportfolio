/**
 * Copies the OpenCascade WASM binary that occt-import-js needs for STEP/IGES
 * parsing into public/wasm, where the browser can fetch it at /wasm/.
 *
 * It lives in node_modules and is ~7MB, so it's copied on install rather than
 * committed — that keeps the repo lean and the binary always in sync with the
 * installed package version.
 */
import { copyFile, mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const source = join(root, "node_modules", "occt-import-js", "dist", "occt-import-js.wasm")
const targetDir = join(root, "public", "wasm")
const target = join(targetDir, "occt-import-js.wasm")

if (!existsSync(source)) {
  // Not fatal: every other format still loads, and the viewer surfaces a clear
  // message if a STEP file is opened without it.
  console.warn("[copy-cad-wasm] occt-import-js WASM not found — STEP/IGES support will be unavailable.")
  process.exit(0)
}

await mkdir(targetDir, { recursive: true })
await copyFile(source, target)
console.log("[copy-cad-wasm] STEP/IGES WASM ready at public/wasm/occt-import-js.wasm")

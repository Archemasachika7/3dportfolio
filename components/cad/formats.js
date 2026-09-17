/**
 * Format registry for the CAD viewer.
 *
 * Split into two families because they load very differently:
 *  - mesh formats are parsed by three.js loaders already in the bundle
 *  - CAD formats (STEP/IGES) carry B-rep solids, not triangles, so they need
 *    OpenCascade (occt-import-js, ~7MB WASM) to tessellate them first. That is
 *    loaded on demand, only when someone actually opens one.
 */

export const MESH_FORMATS = {
  stl: { label: "STL", loader: "stl", binary: true },
  obj: { label: "OBJ", loader: "obj", binary: false },
  glb: { label: "GLB", loader: "gltf", binary: true },
  gltf: { label: "glTF", loader: "gltf", binary: true },
  "3mf": { label: "3MF", loader: "3mf", binary: true },
  ply: { label: "PLY", loader: "ply", binary: true },
  dae: { label: "COLLADA", loader: "collada", binary: false },
  fbx: { label: "FBX", loader: "fbx", binary: true }
}

export const CAD_FORMATS = {
  step: { label: "STEP", loader: "occt", binary: true },
  stp: { label: "STEP", loader: "occt", binary: true },
  iges: { label: "IGES", loader: "occt", binary: true },
  igs: { label: "IGES", loader: "occt", binary: true },
  brep: { label: "BREP", loader: "occt", binary: true }
}

/**
 * Native CAD files that are proprietary, undocumented container formats. No
 * browser library can open these — they're listed so the viewer can say so
 * precisely instead of failing with a parse error.
 */
export const UNSUPPORTED_NATIVE = {
  sldprt: "SolidWorks part",
  sldasm: "SolidWorks assembly",
  ipt: "Inventor part",
  iam: "Inventor assembly",
  f3d: "Fusion 360 archive",
  f3z: "Fusion 360 archive",
  catpart: "CATIA part",
  catproduct: "CATIA assembly",
  prt: "NX / Creo part",
  asm: "Creo assembly",
  dwg: "AutoCAD drawing",
  rvt: "Revit model",
  "3dm": "Rhino model",
  skp: "SketchUp model"
}

export const ALL_FORMATS = { ...MESH_FORMATS, ...CAD_FORMATS }

/** Accept attribute for file inputs — every format the viewer can actually open. */
export const ACCEPT_EXTENSIONS = Object.keys(ALL_FORMATS)
  .map((ext) => `.${ext}`)
  .join(",")

export function extensionOf(nameOrUrl) {
  if (!nameOrUrl) return ""
  // Strip query/hash first so signed Storage URLs don't poison the extension.
  const clean = String(nameOrUrl).split(/[?#]/)[0]
  const last = clean.split("/").pop() || ""
  const dot = last.lastIndexOf(".")
  return dot === -1 ? "" : last.slice(dot + 1).toLowerCase()
}

export function describeFormat(nameOrUrl) {
  const ext = extensionOf(nameOrUrl)
  if (ALL_FORMATS[ext]) {
    return { ext, supported: true, ...ALL_FORMATS[ext] }
  }
  if (UNSUPPORTED_NATIVE[ext]) {
    return { ext, supported: false, reason: "native", label: UNSUPPORTED_NATIVE[ext] }
  }
  return { ext, supported: false, reason: "unknown", label: ext ? ext.toUpperCase() : "unknown" }
}

/** Human-readable list for empty-state copy. */
export const SUPPORTED_SUMMARY = "STEP · IGES · STL · OBJ · GLB · glTF · 3MF · PLY · FBX · DAE"

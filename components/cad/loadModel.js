/**
 * Turns a CAD/mesh file into a three.js Object3D.
 *
 * Every three.js import here is dynamic. The viewer is only ever rendered
 * client-side, and keeping the imports lazy means three and the OpenCascade
 * WASM stay out of the initial bundle for every visitor who never opens a model.
 */
import { CAD_FORMATS, MESH_FORMATS, describeFormat } from "./formats"

/** Where copy-cad-wasm.mjs puts the OpenCascade binary. */
const WASM_DIR = "/wasm/"

function defaultMaterial(THREE, color) {
  return new THREE.MeshStandardMaterial({
    color: color ?? 0xb8bcc2,
    metalness: 0.08,
    roughness: 0.62,
    flatShading: false
  })
}

/**
 * STEP/IGES store trimmed B-rep surfaces rather than triangles, so OpenCascade
 * has to tessellate them before three.js can draw anything.
 */
async function loadWithOcct(THREE, buffer, ext) {
  const occtimportjs = (await import("occt-import-js")).default

  let occt
  try {
    occt = await occtimportjs({ locateFile: (file) => WASM_DIR + file })
  } catch (cause) {
    throw new Error(
      "Could not load the OpenCascade engine needed for STEP/IGES files. Run `npm install` to restore public/wasm.",
      { cause }
    )
  }

  const bytes = new Uint8Array(buffer)
  const read =
    ext === "iges" || ext === "igs"
      ? occt.ReadIgesFile
      : ext === "brep"
        ? occt.ReadBrepFile
        : occt.ReadStepFile

  const result = read(bytes, null)
  if (!result?.success || !result.meshes?.length) {
    throw new Error("OpenCascade could not read any geometry from this file. It may be corrupt or an unsupported revision.")
  }

  const group = new THREE.Group()
  for (const mesh of result.meshes) {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(mesh.attributes.position.array, 3)
    )
    if (mesh.attributes.normal?.array) {
      geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(mesh.attributes.normal.array, 3)
      )
    }
    if (mesh.index?.array) {
      geometry.setIndex(new THREE.Uint32BufferAttribute(mesh.index.array, 1))
    }
    if (!mesh.attributes.normal?.array) geometry.computeVertexNormals()

    // STEP carries per-solid colour; fall back to the neutral shop grey.
    const color = mesh.color
      ? new THREE.Color(mesh.color[0], mesh.color[1], mesh.color[2])
      : undefined
    const object = new THREE.Mesh(geometry, defaultMaterial(THREE, color))
    object.name = mesh.name || "solid"
    group.add(object)
  }
  return group
}

async function loadMesh(THREE, data, ext) {
  const { loader } = MESH_FORMATS[ext]

  switch (loader) {
    case "stl": {
      const { STLLoader } = await import("three/examples/jsm/loaders/STLLoader.js")
      const geometry = new STLLoader().parse(data)
      geometry.computeVertexNormals()
      return new THREE.Mesh(geometry, defaultMaterial(THREE))
    }
    case "ply": {
      const { PLYLoader } = await import("three/examples/jsm/loaders/PLYLoader.js")
      const geometry = new PLYLoader().parse(data)
      geometry.computeVertexNormals()
      return new THREE.Mesh(geometry, defaultMaterial(THREE))
    }
    case "obj": {
      const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js")
      const text = typeof data === "string" ? data : new TextDecoder().decode(data)
      return new OBJLoader().parse(text)
    }
    case "gltf": {
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js")
      const gltf = await new GLTFLoader().parseAsync(data, "")
      return gltf.scene
    }
    case "3mf": {
      const { ThreeMFLoader } = await import("three/examples/jsm/loaders/3MFLoader.js")
      return new ThreeMFLoader().parse(data)
    }
    case "collada": {
      const { ColladaLoader } = await import("three/examples/jsm/loaders/ColladaLoader.js")
      const text = typeof data === "string" ? data : new TextDecoder().decode(data)
      return new ColladaLoader().parse(text, "").scene
    }
    case "fbx": {
      const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js")
      return new FBXLoader().parse(data, "")
    }
    default:
      throw new Error(`No loader registered for .${ext}`)
  }
}

/**
 * Fetches a URL with real byte progress when the server sends Content-Length.
 * CAD files are routinely tens of MB, so a determinate bar matters here.
 */
async function fetchWithProgress(url, onProgress) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Could not fetch the model (HTTP ${response.status}).`)
  }

  const total = Number(response.headers.get("content-length")) || 0
  if (!total || !response.body) {
    onProgress?.(null)
    return await response.arrayBuffer()
  }

  const reader = response.body.getReader()
  const chunks = []
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    onProgress?.(Math.min(100, Math.round((received / total) * 100)))
  }

  const merged = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }
  return merged.buffer
}

/**
 * @param {object} options
 * @param {string} [options.url]  Remote model URL (Supabase Storage, etc.)
 * @param {File}   [options.file] Local file chosen by the visitor
 * @param {(pct: number|null) => void} [options.onProgress]
 * @returns {Promise<{ object: import('three').Object3D, format: object }>}
 */
export async function loadModel({ url, file, onProgress }) {
  const name = file?.name || url
  const format = describeFormat(name)

  if (!format.supported) {
    throw new Error(
      format.reason === "native"
        ? `${format.label} files are a proprietary format that can't be opened in a browser. Export to STEP or STL and try again.`
        : `Unrecognised file type${format.ext ? ` (.${format.ext})` : ""}. Export to STEP or STL and try again.`
    )
  }

  const THREE = await import("three")

  const buffer = file ? await file.arrayBuffer() : await fetchWithProgress(url, onProgress)
  onProgress?.(100)

  const object =
    format.ext in CAD_FORMATS
      ? await loadWithOcct(THREE, buffer, format.ext)
      : await loadMesh(THREE, buffer, format.ext)

  if (!object) throw new Error("The file parsed but contained no geometry.")
  return { object, format }
}

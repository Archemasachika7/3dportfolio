"use client"

import { useEffect, useState } from "react"
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { auth, db } from "../../lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore"

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  // AUTH CHECK
  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user && user.email === "beingthebestarche@gmail.com") {
        setUser(user)
        loadProjects()
      } else {
        setUser(null)
      }
    })
  }, [])

  // LOGIN
  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setError("")
    } catch {
      setError("Invalid credentials")
    }
  }

  // LOAD PROJECTS
  const loadProjects = async () => {
    const snap = await getDocs(collection(db, "projects"))
    setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  // ADD PROJECT
  const addProject = async () => {
    await addDoc(collection(db, "projects"), { title, description })
    setTitle("")
    setDescription("")
    loadProjects()
  }

  // UPDATE PROJECT
  const updateProject = async (id, t, d) => {
    await updateDoc(doc(db, "projects", id), {
      title: t,
      description: d
    })
    loadProjects()
  }

  // DELETE PROJECT
  const deleteProject = async (id) => {
    await deleteDoc(doc(db, "projects", id))
    loadProjects()
  }

  // 🔐 LOGIN SCREEN
  if (!user) {
    return (
      <main style={authContainer}>
        <div style={authBox}>
          <h2>Admin Login</h2>

          <input
            placeholder="Email"
            onChange={e => setEmail(e.target.value)}
            style={input}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={e => setPassword(e.target.value)}
            style={input}
          />

          <button onClick={login} style={button}>
            Login
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </main>
    )
  }

  // 🧠 DASHBOARD
  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "auto" }}>
      <h1>Admin Dashboard</h1>

      <section style={{ marginTop: 30 }}>
        <h3>Add Project</h3>

        <input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={input}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={input}
        />

        <button onClick={addProject} style={button}>
          Add Project
        </button>
      </section>

      <hr style={{ margin: "40px 0" }} />

      <h3>Existing Projects</h3>

      {projects.map(p => (
        <ProjectEditor
          key={p.id}
          project={p}
          onUpdate={updateProject}
          onDelete={deleteProject}
        />
      ))}
    </main>
  )
}

function ProjectEditor({ project, onUpdate, onDelete }) {
  const [t, setT] = useState(project.title)
  const [d, setD] = useState(project.description)

  return (
    <div style={card}>
      <input value={t} onChange={e => setT(e.target.value)} style={input} />
      <textarea value={d} onChange={e => setD(e.target.value)} style={input} />

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => onUpdate(project.id, t, d)} style={button}>
          Save
        </button>
        <button
          onClick={() => onDelete(project.id)}
          style={{ ...button, background: "#7f1d1d" }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

/* ---------- STYLES ---------- */

const authContainer = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#020617"
}

const authBox = {
  background: "#020617",
  border: "1px solid #1e293b",
  padding: 32,
  borderRadius: 12,
  width: 320
}

const input = {
  width: "100%",
  padding: 10,
  marginTop: 12,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#020617",
  color: "#e5e7eb"
}

const button = {
  marginTop: 16,
  padding: "10px 14px",
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  border: "none",
  cursor: "pointer"
}

const card = {
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: 20,
  marginTop: 20
}

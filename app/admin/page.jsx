"use client"

import { useEffect, useState } from "react"
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth"
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function Admin() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [projects, setProjects] = useState([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user && user.email === "beingthebestarche@gmail.com") {
        setUser(user)
        loadProjects()
      }
    })
  }, [])

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setMsg("Admin logged in")
    } catch {
      setMsg("Access denied")
    }
  }

  const loadProjects = async () => {
    const snap = await getDocs(collection(db, "projects"))
    setProjects(
      snap.docs.map(d => ({ id: d.id, ...d.data() }))
    )
  }

  const addProject = async () => {
    await addDoc(collection(db, "projects"), {
      title,
      description
    })
    setTitle("")
    setDescription("")
    loadProjects()
  }

  const updateProject = async (id, newTitle, newDesc) => {
    await updateDoc(doc(db, "projects", id), {
      title: newTitle,
      description: newDesc
    })
    loadProjects()
  }

  const deleteProject = async (id) => {
    await deleteDoc(doc(db, "projects", id))
    loadProjects()
  }

  if (!user) {
    return (
      <main style={{ padding: 40 }}>
        <h2>Admin Login</h2>
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} /><br />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} /><br />
        <button onClick={login}>Login</button>
        <p>{msg}</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Admin Dashboard</h1>

      <h3>Add New Project</h3>
      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      /><br />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      /><br />
      <button onClick={addProject}>Add Project</button>

      <hr style={{ margin: "30px 0" }} />

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
    <div style={{
      border: "1px solid #334155",
      padding: 16,
      marginBottom: 16
    }}>
      <input value={t} onChange={e => setT(e.target.value)} /><br />
      <textarea value={d} onChange={e => setD(e.target.value)} /><br />

      <button onClick={() => onUpdate(project.id, t, d)}>
        Save
      </button>
      <button
        style={{ marginLeft: 10, color: "red" }}
        onClick={() => onDelete(project.id)}
      >
        Delete
      </button>
    </div>
  )
}

"use client"

import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { addDoc, collection } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function Admin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [msg, setMsg] = useState("")

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setMsg("Admin logged in")
    } catch {
      setMsg("Access denied")
    }
  }

  const addProject = async () => {
    try {
      await addDoc(collection(db, "projects"), {
        title,
        description
      })
      setMsg("Project added")
    } catch {
      setMsg("Not allowed")
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Admin Panel</h1>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} /><br />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} /><br />
      <button onClick={login}>Login</button>

      <hr style={{ margin: "30px 0" }} />

      <h3>Add Project</h3>
      <input placeholder="Title" onChange={e => setTitle(e.target.value)} /><br />
      <textarea placeholder="Description" onChange={e => setDescription(e.target.value)} /><br />
      <button onClick={addProject}>Add</button>

      <p>{msg}</p>
    </main>
  )
}

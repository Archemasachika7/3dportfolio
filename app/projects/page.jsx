"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase"

export default function Projects() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "projects"))
      setProjects(snap.docs.map(d => d.data()))
    }
    load()
  }, [])

  return (
    <main style={{ padding: 40 }}>
      <h1>Projects</h1>

      {projects.map((p, i) => (
        <div key={i} style={{
          border: "1px solid #334155",
          padding: 16,
          marginBottom: 20
        }}>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
        </div>
      ))}
    </main>
  )
}

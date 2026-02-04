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
    <section style={{ padding: "60px 32px", maxWidth: 1100, margin: "auto" }}>
      <h1 style={{ marginBottom: 30 }}>Projects</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20
        }}
      >
        {projects.map((p, i) => (
          <div
            key={i}
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: 12,
              padding: 20
            }}
          >
            <h3>{p.title}</h3>
            <p style={{ color: "#cbd5f5" }}>{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

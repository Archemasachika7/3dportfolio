"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"

export default function Resume() {
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const load = async () => {
      const pSnap = await getDoc(doc(db, "profile", "main"))
      setProfile(pSnap.data())

      const projSnap = await getDocs(collection(db, "projects"))
      setProjects(projSnap.docs.map(d => d.data()))
    }
    load()
  }, [])

  return (
    <section style={{ padding: "60px 32px", maxWidth: 900, margin: "auto" }}>
      {/* HEADER */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 36 }}>{profile?.name}</h1>
        <p style={{ fontSize: 18, color: "#94a3b8" }}>
          {profile?.title}
        </p>
        <p style={{ marginTop: 12, maxWidth: 700 }}>
          {profile?.summary}
        </p>
      </div>

      {/* PROJECTS */}
      <h2 style={{ marginBottom: 20 }}>Projects</h2>

      <div style={{ display: "grid", gap: 16 }}>
        {projects.map((p, i) => (
          <div
            key={i}
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              padding: 20,
              borderRadius: 10
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

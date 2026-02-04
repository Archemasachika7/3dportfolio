"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase"
import MotionWrapper from "../../components/MotionWrapper"

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
    <section style={{ maxWidth: 1100, margin: "auto", padding: "80px 32px" }}>
      <h1>Projects</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
          marginTop: 32
        }}
      >
        {projects.map((p, i) => (
          <MotionWrapper key={i} delay={i * 0.08}>
            <div
              style={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 16,
                padding: 24
              }}
            >
              <h3>{p.title}</h3>
              <p style={{ color: "#cbd5f5" }}>{p.description}</p>
            </div>
          </MotionWrapper>
        ))}
      </div>
    </section>
  )
}

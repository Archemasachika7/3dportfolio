"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import MotionWrapper from "../../components/MotionWrapper"

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
    <section style={{ maxWidth: 900, margin: "auto", padding: "80px 32px" }}>
      <MotionWrapper>
        <h1 style={{ fontSize: 38 }}>{profile?.name}</h1>
        <p style={{ color: "#94a3b8" }}>{profile?.title}</p>
        <p style={{ marginTop: 16 }}>{profile?.summary}</p>
      </MotionWrapper>

      {/* TIMELINE */}
      <h2 style={{ marginTop: 60 }}>Education</h2>

      <div style={{ borderLeft: "2px solid #1e293b", marginTop: 24 }}>
        {[
          {
            year: "2024 – Present",
            text: "B.E. Civil Engineering, Jadavpur University"
          },
          {
            year: "2023 – Present",
            text: "BS Data Science, IIT Madras"
          }
        ].map((item, i) => (
          <MotionWrapper key={i} delay={i * 0.1}>
            <div style={{ paddingLeft: 20, marginBottom: 24 }}>
              <strong>{item.year}</strong>
              <p>{item.text}</p>
            </div>
          </MotionWrapper>
        ))}
      </div>

      {/* PROJECTS */}
      <h2 style={{ marginTop: 60 }}>Selected Projects</h2>

      <div style={{ display: "grid", gap: 20, marginTop: 20 }}>
        {projects.map((p, i) => (
          <MotionWrapper key={i} delay={i * 0.08}>
            <div
              style={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 14,
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

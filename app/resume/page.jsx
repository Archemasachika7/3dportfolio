"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { motion } from "framer-motion"

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
    <section
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "80px 32px"
      }}
    >
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 style={{ fontSize: 38 }}>{profile?.name}</h1>
        <p style={{ color: "#94a3b8", fontSize: 18 }}>
          {profile?.title}
        </p>
        <p style={{ marginTop: 16, maxWidth: 700 }}>
          {profile?.summary}
        </p>
      </motion.div>

      {/* PROJECTS */}
      <h2 style={{ marginTop: 64, marginBottom: 24 }}>
        Selected Projects
      </h2>

      <div style={{ display: "grid", gap: 20 }}>
        {projects.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: "#020617",
              border: "1px solid #1e293b",
              padding: 24,
              borderRadius: 14
            }}
          >
            <h3>{p.title}</h3>
            <p style={{ color: "#cbd5f5" }}>
              {p.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

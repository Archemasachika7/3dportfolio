"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import MotionWrapper from "../../components/MotionWrapper"
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
    <MotionWrapper>
      <section style={{ padding: "60px 32px", maxWidth: 900, margin: "auto" }}>
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 style={{ fontSize: 36 }}>{profile?.name}</h1>
          <p style={{ color: "#94a3b8", fontSize: 18 }}>
            {profile?.title}
          </p>
          <p style={{ marginTop: 12 }}>{profile?.summary}</p>
        </motion.div>

        <h2 style={{ marginTop: 50 }}>Projects</h2>

        <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
          {projects.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              style={{
                background: "#020617",
                border: "1px solid #1e293b",
                padding: 20,
                borderRadius: 12
              }}
            >
              <h3>{p.title}</h3>
              <p style={{ color: "#cbd5f5" }}>{p.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </MotionWrapper>
  )
}

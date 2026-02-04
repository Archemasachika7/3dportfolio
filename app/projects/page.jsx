"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { motion } from "framer-motion"
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
    <MotionWrapper>
      <section style={{ padding: "60px 32px", maxWidth: 1100, margin: "auto" }}>
        <h1 style={{ marginBottom: 30 }}>Projects</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24
          }}
        >
          {projects.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.04, y: -6 }}
              style={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 14,
                padding: 22
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

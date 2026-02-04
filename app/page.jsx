"use client"

import Hero3D from "../components/Hero3D"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr"
      }}
    >
      {/* LEFT — 3D */}
      <div style={{ background: "#020617" }}>
        <Hero3D />
      </div>

      {/* RIGHT — CONTENT */}
      <div
        style={{
          padding: "80px 60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ fontSize: 48 }}
        >
          Archishman Das
        </motion.h1>

        <p style={{ color: "#94a3b8", fontSize: 18, marginTop: 12 }}>
          Civil Engineering · Jadavpur University  
          <br />
          BS Data Science · IIT Madras
        </p>

        <p style={{ marginTop: 24, maxWidth: 520 }}>
          I build systems at the intersection of engineering,
          data, and technology — from structural logic to
          intelligent web platforms.
        </p>

        <div style={{ marginTop: 36, display: "flex", gap: 16 }}>
          <a href="/resume" style={primaryBtn}>
            View Resume
          </a>
          <a href="/projects" style={secondaryBtn}>
            View Projects
          </a>
        </div>
      </div>
    </section>
  )
}

const primaryBtn = {
  background: "#2563eb",
  padding: "12px 20px",
  borderRadius: 10,
  color: "#fff",
  textDecoration: "none",
  fontWeight: 500
}

const secondaryBtn = {
  padding: "12px 20px",
  borderRadius: 10,
  border: "1px solid #1e293b",
  color: "#e5e7eb",
  textDecoration: "none"
}

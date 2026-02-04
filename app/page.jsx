"use client"

import { motion } from "framer-motion"

export default function Home() {
  return (
    <section
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "80px 32px"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1
          style={{
            fontSize: 52,
            lineHeight: 1.1,
            maxWidth: 800
          }}
        >
          Archishman Das
        </h1>

        <p
          style={{
            marginTop: 16,
            fontSize: 20,
            color: "#94a3b8"
          }}
        >
          Civil Engineering · Jadavpur University  
          <br />
          BS Data Science · IIT Madras
        </p>

        <p
          style={{
            marginTop: 28,
            fontSize: 17,
            maxWidth: 640
          }}
        >
          I work at the intersection of engineering, data, and technology —
          building systems that analyze, optimize, and scale real-world problems.
        </p>

        {/* FOCUS STRIP */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 36
          }}
        >
          {[
            "Structural Engineering",
            "Data Science",
            "Web Systems",
            "Problem Solving"
          ].map(tag => (
            <span
              key={tag}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                background: "#020617",
                border: "1px solid #1e293b",
                fontSize: 14
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 48, display: "flex", gap: 16 }}>
          <a
            href="/resume"
            style={primaryBtn}
          >
            View Resume
          </a>
          <a
            href="/projects"
            style={secondaryBtn}
          >
            View Projects
          </a>
        </div>
      </motion.div>
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

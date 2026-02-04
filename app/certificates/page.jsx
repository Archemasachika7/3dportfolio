"use client"

import MotionWrapper from "../../components/MotionWrapper"

export default function Certificates() {
  const items = [
    {
      title: "BS Data Science",
      issuer: "IIT Madras",
      year: "2024"
    },
    {
      title: "Programming & DSA",
      issuer: "Self / Online",
      year: "2023"
    }
  ]

  return (
    <section style={{ maxWidth: 900, margin: "auto", padding: "80px 32px" }}>
      <h1>Certificates & Scores</h1>

      <div style={{ marginTop: 32, display: "grid", gap: 20 }}>
        {items.map((c, i) => (
          <MotionWrapper key={i} delay={i * 0.1}>
            <div
              style={{
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: 14,
                padding: 24
              }}
            >
              <h3>{c.title}</h3>
              <p style={{ color: "#94a3b8" }}>
                {c.issuer} · {c.year}
              </p>
            </div>
          </MotionWrapper>
        ))}
      </div>
    </section>
  )
}

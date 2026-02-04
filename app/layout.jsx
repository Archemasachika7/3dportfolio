export const metadata = {
  title: "Archishman Das | Portfolio",
  description: "Civil Engineering & Data Science Portfolio"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Inter, system-ui, Arial",
          background: "#020617",
          color: "#e5e7eb",
          lineHeight: 1.6
        }}
      >
        {/* NAVBAR */}
        <nav
          style={{
            padding: "20px 32px",
            borderBottom: "1px solid #1e293b",
            display: "flex",
            gap: 28,
            fontSize: 15
          }}
        >
          <a href="/">Home</a>
          <a href="/resume">Resume</a>
          <a href="/projects">Projects</a>
          <a href="/certificates">Certificates</a>

        </nav>

        {/* CONTENT */}
        <main style={{ minHeight: "100vh" }}>
          {children}
        </main>
      </body>
    </html>
  )
}

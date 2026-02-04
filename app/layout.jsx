export const metadata = {
  title: "Archishman | Portfolio",
  description: "Civil Engineering & Data Science Portfolio"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Inter, system-ui, Arial",
          background: "#0b1120",
          color: "#e5e7eb"
        }}
      >
        {/* NAVBAR */}
        <nav
          style={{
            padding: "16px 32px",
            borderBottom: "1px solid #1e293b",
            display: "flex",
            gap: 24,
            fontWeight: 500
          }}
        >
          <a href="/">Home</a>
          <a href="/resume">Resume</a>
          <a href="/projects">Projects</a>
        </nav>

        {/* PAGE CONTENT */}
        <main style={{ minHeight: "100vh" }}>{children}</main>
      </body>
    </html>
  )
}

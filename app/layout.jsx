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
          background: "#020617",
          color: "#e5e7eb"
        }}
      >
        <nav
          style={{
            padding: "16px 32px",
            display: "flex",
            gap: 24,
            borderBottom: "1px solid #1e293b"
          }}
        >
          <a href="/">Home</a>
          <a href="/resume">Resume</a>
          <a href="/projects">Projects</a>
        </nav>

        {children}
      </body>
    </html>
  )
}

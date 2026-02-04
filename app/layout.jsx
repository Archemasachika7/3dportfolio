export const metadata = {
  title: "Dynamic Portfolio"
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: "Arial, sans-serif",
        background: "#0f172a",
        color: "#e5e7eb"
      }}>
        <nav style={{
          padding: "16px",
          borderBottom: "1px solid #334155"
        }}>
          <a href="/" style={{ marginRight: 20 }}>Home</a>
          <a href="/resume" style={{ marginRight: 20 }}>Resume</a>
          <a href="/projects">Projects</a>
        </nav>
        {children}
      </body>
    </html>
  )
}

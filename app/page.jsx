export default function Home() {
  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 36 }}>Your Name</h1>
      <p style={{ fontSize: 18 }}>
        Civil Engineering (Jadavpur University) <br />
        BS Data Science (IIT Madras)
      </p>

      <p style={{ maxWidth: 600, marginTop: 20 }}>
        This is a dynamic portfolio where my resume, projects, and
        achievements are generated automatically from live data.
      </p>

      <p style={{ marginTop: 30 }}>
        Scroll through or visit individual sections to explore more.
      </p>
    </main>
  )
}

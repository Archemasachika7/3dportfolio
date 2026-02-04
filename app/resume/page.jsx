import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default async function Resume() {
  const profileSnap = await getDocs(collection(db, "profile"))
  const projectsSnap = await getDocs(collection(db, "projects"))

  const profile = profileSnap.docs[0]?.data()
  const projects = projectsSnap.docs.map(d => d.data())

  return (
    <main style={{ padding: 40, maxWidth: 900 }}>
      <h1>{profile?.name}</h1>
      <h3>{profile?.title}</h3>
      <p style={{ marginTop: 10 }}>{profile?.summary}</p>

      <hr style={{ margin: "30px 0" }} />

      <h2>Projects</h2>

      {projects.length === 0 && <p>No projects yet.</p>}

      {projects.map((p, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <strong>{p.title}</strong>
          <p>{p.description}</p>
        </div>
      ))}
    </main>
  )
}


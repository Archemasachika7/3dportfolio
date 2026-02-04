import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default async function Projects() {
  const snap = await getDocs(collection(db, "projects"))
  const projects = snap.docs.map(d => d.data())

  return (
    <main style={{ padding: 40 }}>
      <h1>Projects</h1>

      {projects.map((p, i) => (
        <div key={i} style={{
          border: "1px solid #334155",
          padding: 16,
          marginBottom: 20
        }}>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
        </div>
      ))}
    </main>
  )
}

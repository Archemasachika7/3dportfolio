"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"

export default function Resume() {
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const load = async () => {
      const pSnap = await getDoc(doc(db, "profile", "main"))
      setProfile(pSnap.data())

      const projSnap = await getDocs(collection(db, "projects"))
      setProjects(projSnap.docs.map(d => d.data()))
    }
    load()
  }, [])

  return (
    <main style={{ padding: 40, maxWidth: 900 }}>
      <h1>{profile?.name}</h1>
      <h3>{profile?.title}</h3>
      <p>{profile?.summary}</p>

      <hr style={{ margin: "30px 0" }} />

      <h2>Projects</h2>
      {projects.map((p, i) => (
        <div key={i}>
          <strong>{p.title}</strong>
          <p>{p.description}</p>
        </div>
      ))}
    </main>
  )
}

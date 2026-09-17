import styles from "./certificates.module.css"

export const metadata = {
  title: "Certificates | Archishman Das",
  description: "Certificates, scores and academic credentials."
}

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

export default function Certificates() {
  return (
    <section className={styles.section} aria-label="Certificates">
      <div className={styles.intro}>
        <span className="label">CREDENTIALS</span>
        <h1 className={styles.heading}>CERTIFICATES & SCORES</h1>
      </div>

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.title} className={styles.item}>
            <span className={styles.itemTitle}>{item.title}</span>
            <span className={styles.itemMeta}>
              {item.issuer} · {item.year}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

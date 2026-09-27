import { getCertificates } from "../../lib/queries"
import styles from "./certificates.module.css"

export const revalidate = 60

export const metadata = {
  title: "Certificates | Archishman Das",
  description: "Certificates, scores and academic credentials."
}

function formatDate(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" }).toUpperCase()
}

export default async function Certificates() {
  const certificates = await getCertificates()

  return (
    <section className={styles.section} aria-label="Certificates">
      <div className={styles.intro}>
        <span className="label">CREDENTIALS</span>
        <h1 className={styles.heading}>CERTIFICATES & SCORES</h1>
      </div>

      {certificates.length === 0 ? (
        <p className={styles.empty}>No certificates published yet.</p>
      ) : (
        <ul className={styles.grid}>
          {certificates.map((c) => {
            const issued = formatDate(c.issue_date)
            const link = c.file_url || c.credential_url || c.image_url
            return (
              <li key={c.id} className={styles.card}>
                {c.image_url && (
                  <a href={c.file_url || c.image_url} target="_blank" rel="noreferrer" className={styles.picture} data-cursor="interactive">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image_url} alt={`${c.title} certificate`} loading="lazy" />
                  </a>
                )}
                <div className={styles.body}>
                  <span className={styles.itemTitle}>{c.title}</span>
                  <span className={styles.itemMeta}>
                    {[c.issuer, issued].filter(Boolean).join(" · ")}
                  </span>
                  {c.description && <p className={styles.description}>{c.description}</p>}
                  {(link || c.credential_id) && (
                    <span className={styles.links}>
                      {c.file_url && (
                        <a href={c.file_url} target="_blank" rel="noreferrer" className={styles.link} data-cursor="interactive">
                          VIEW CERTIFICATE ↗
                        </a>
                      )}
                      {c.credential_url && (
                        <a href={c.credential_url} target="_blank" rel="noreferrer" className={styles.link} data-cursor="interactive">
                          VERIFY ↗
                        </a>
                      )}
                      {c.credential_id && <span className={styles.credential}>ID {c.credential_id}</span>}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

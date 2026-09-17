import { getCurrentResume } from "../../lib/queries"
import styles from "./resume.module.css"

export const revalidate = 60

export const metadata = {
  title: "Resume | Archishman Das",
  description: "The current resume."
}

export default async function ResumePage() {
  const resume = await getCurrentResume()

  return (
    <section className={styles.section} aria-label="Resume">
      <div className={styles.intro}>
        <span className="label">RESUME</span>
        <h1 className={styles.heading}>THE RIGHT VERSION FOR THE RIGHT PATH</h1>
        <p className={styles.subheading}>
          Looking for a specific domain? The <a href="/map">career map</a> matches you to the
          most relevant resume automatically.
        </p>
      </div>

      {!resume ? (
        <p className={styles.empty}>No resume published yet.</p>
      ) : (
        <div className={styles.viewer}>
          <div className={styles.viewerHeader}>
            <span className="label">RESUME — {resume.title.toUpperCase()}</span>
          </div>

          {resume.file_url ? (
            <iframe
              src={resume.file_url}
              title={resume.title}
              className={styles.frame}
            />
          ) : (
            <p className={styles.status}>Resume file unavailable.</p>
          )}

          <div className={styles.actions}>
            {resume.file_url && (
              <a
                href={resume.file_url}
                download
                className={styles.actionLink}
                data-cursor="interactive"
              >
                DOWNLOAD
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

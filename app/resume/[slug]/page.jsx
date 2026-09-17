import { notFound } from "next/navigation"
import { getResumeBySlug } from "../../../lib/queries"
import styles from "../resume.module.css"

export const revalidate = 60

export async function generateMetadata({ params }) {
  const resume = await getResumeBySlug(params.slug)
  return { title: resume ? `${resume.title} | Archishman Das` : "Resume | Archishman Das" }
}

export default async function ResumeVariantPage({ params }) {
  const resume = await getResumeBySlug(params.slug)
  if (!resume) notFound()

  return (
    <section className={styles.section} aria-label="Resume">
      <div className={styles.intro}>
        <span className="label">RESUME</span>
        <h1 className={styles.heading}>{resume.title.toUpperCase()}</h1>
        {resume.description && <p className={styles.subheading}>{resume.description}</p>}
      </div>

      <div className={styles.viewer}>
        {resume.file_url ? (
          <iframe src={resume.file_url} title={resume.title} className={styles.frame} />
        ) : (
          <p className={styles.status}>Resume file unavailable.</p>
        )}

        <div className={styles.actions}>
          {resume.file_url && (
            <a href={resume.file_url} download className={styles.actionLink} data-cursor="interactive">
              DOWNLOAD
            </a>
          )}
        </div>
      </div>

      <a href="/resume" className={styles.back} data-cursor="interactive">
        ← CURRENT RESUME
      </a>
    </section>
  )
}

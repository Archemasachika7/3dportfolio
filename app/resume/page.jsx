import { getCurrentResume, getResumes } from "../../lib/queries"
import PdfViewer from "../../components/resume/PdfViewer"
import styles from "./resume.module.css"

export const revalidate = 60

export const metadata = {
  title: "Resume | Archishman Das",
  description: "The current resume."
}

export default async function ResumePage() {
  const [resume, all] = await Promise.all([getCurrentResume(), getResumes()])
  const others = all.filter((r) => r.file_url && r.id !== resume?.id)

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

      {!resume?.file_url ? (
        <p className={styles.empty}>No resume published yet.</p>
      ) : (
        <>
          <div className={styles.viewerHeader}>
            <span className="label">RESUME — {resume.title.toUpperCase()}</span>
          </div>
          <PdfViewer url={resume.file_url} title={resume.title} fileName={resume.file_name} isPdf={resume.is_pdf} />
        </>
      )}

      {others.length > 0 && (
        <div className={styles.others}>
          <span className="label">OTHER VERSIONS</span>
          <ul className={styles.otherList}>
            {others.map((r) => (
              <li key={r.id}>
                <a href={`/resume/${r.slug}`} className={styles.otherLink} data-cursor="interactive">
                  <span>{r.title}</span>
                  {r.description && <span className={styles.otherMeta}>{r.description}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

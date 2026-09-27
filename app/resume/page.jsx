import { getCurrentResume, getResumes } from "../../lib/queries"
import PdfViewer from "../../components/resume/PdfViewer"
import Reveal from "../../components/motion/Reveal"
import PageIntro from "../../components/motion/PageIntro"
import SheetLabel from "../../components/motion/SheetLabel"
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
      <PageIntro className={styles.intro}>
        <SheetLabel index="04" label="RESUME" />
        <h1 className={styles.heading} data-intro-heading><span>THE RIGHT VERSION FOR THE RIGHT PATH</span></h1>
        <p className={styles.subheading} data-intro-item style={{ "--d": 0 }}>
          Looking for a specific domain? The <a href="/map">career map</a> matches you to the
          most relevant resume automatically.
        </p>
      </PageIntro>

      <Reveal style={{ display: "contents" }}>

        {!resume?.file_url ? (
          <p className={styles.empty}>No resume published yet.</p>
        ) : (
          <div data-reveal>
            <div className={styles.viewerHeader}>
              <span className="label">RESUME — {resume.title.toUpperCase()}</span>
            </div>
            <PdfViewer url={resume.file_url} title={resume.title} fileName={resume.file_name} isPdf={resume.is_pdf} />
          </div>
        )}

        {others.length > 0 && (
          <div className={styles.others} data-reveal>
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
      </Reveal>
    </section>
  )
}

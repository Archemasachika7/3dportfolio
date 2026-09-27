import { notFound } from "next/navigation"
import { getResumeBySlug } from "../../../lib/queries"
import PdfViewer from "../../../components/resume/PdfViewer"
import Reveal from "../../../components/motion/Reveal"
import PageIntro from "../../../components/motion/PageIntro"
import SheetLabel from "../../../components/motion/SheetLabel"
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
      <PageIntro className={styles.intro}>
        <SheetLabel index="04" label="RESUME" />
        <h1 className={styles.heading} data-intro-heading><span>{resume.title.toUpperCase()}</span></h1>
        {resume.description && <p className={styles.subheading} data-intro-item style={{ "--d": 0 }}>{resume.description}</p>}
      </PageIntro>

      {resume.file_url ? (
        <Reveal>
          <div data-reveal>
            <PdfViewer url={resume.file_url} title={resume.title} fileName={resume.file_name} isPdf={resume.is_pdf} />
          </div>
        </Reveal>
      ) : (
        <p className={styles.empty}>Resume file unavailable.</p>
      )}

      <a href="/resume" className={styles.back} data-cursor="interactive">
        ← CURRENT RESUME
      </a>
    </section>
  )
}

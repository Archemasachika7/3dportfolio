import WorkCard from "../../components/work/WorkCard"
import { getPublishedProjects, getProjectsByTagSlugs, getDomainNodes } from "../../lib/queries"
import Reveal from "../../components/motion/Reveal"
import PageIntro from "../../components/motion/PageIntro"
import SheetLabel from "../../components/motion/SheetLabel"
import styles from "./work.module.css"

export const revalidate = 60

export const metadata = {
  title: "Work | Archishman Das",
  description: "Published engineering, data, analytics and leadership projects."
}

export default async function WorkPage({ searchParams }) {
  const filterSlug = searchParams?.filter
  const { lens } = await getDomainNodes()
  const activeNode = filterSlug ? lens.find((n) => n.slug === filterSlug) : null

  const projects = activeNode
    ? await getProjectsByTagSlugs(activeNode.tags.map((t) => t.slug))
    : await getPublishedProjects()

  return (
    <section className={styles.section} aria-label="Work">
      <PageIntro style={{ display: "contents" }}>
        <div className={styles.intro}>
          <SheetLabel index="01" label="WORK" />
          <h1 className={styles.heading} data-intro-heading><span>EVERYTHING I'VE BUILT</span></h1>
          <p className={styles.subheading} data-intro-item style={{ "--d": 0 }}>ENGINEERING / DATA / ANALYTICS / BUSINESS / TECH</p>
        </div>

        <nav className={styles.filters} aria-label="Filter by domain" data-intro-item style={{ "--d": 1 }}>
          <a href="/work" className={styles.filter} data-active={!activeNode ? "true" : "false"}>
            ALL
          </a>
          {lens.map((node) => (
            <a
              key={node.id}
              href={`/work?filter=${node.slug}`}
              className={styles.filter}
              data-active={activeNode?.slug === node.slug ? "true" : "false"}
            >
              {node.label}
            </a>
          ))}
        </nav>
      </PageIntro>

      {projects.length === 0 ? (
        <p className={styles.empty}>No published projects yet.</p>
      ) : (
        <Reveal className={styles.grid}>
          {projects.map((project) => (
            <WorkCard key={project.id} project={project} />
          ))}
        </Reveal>
      )}
    </section>
  )
}

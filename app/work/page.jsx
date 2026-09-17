import WorkCard from "../../components/work/WorkCard"
import { getPublishedProjects, getProjectsByTagSlugs, getDomainNodes } from "../../lib/queries"
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
      <div className={styles.intro}>
        <span className="label">WORK</span>
        <h1 className={styles.heading}>EVERYTHING I'VE BUILT</h1>
        <p className={styles.subheading}>ENGINEERING / DATA / ANALYTICS / BUSINESS / TECH</p>
      </div>

      <nav className={styles.filters} aria-label="Filter by domain">
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

      {projects.length === 0 ? (
        <p className={styles.empty}>No published projects yet.</p>
      ) : (
        <div className={styles.grid}>
          {projects.map((project) => (
            <WorkCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  )
}

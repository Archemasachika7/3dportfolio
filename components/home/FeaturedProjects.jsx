import MotionHeading from "../MotionHeading"
import ProjectReveal from "./ProjectReveal"
import { projects } from "../../data/career"
import styles from "./FeaturedProjects.module.css"

export default function FeaturedProjects() {
  const featured = projects.filter((p) => p.featured)

  return (
    <section className={styles.section} aria-label="Featured projects">
      <div className={styles.intro}>
        <span className="label">04 / SELECTED WORK</span>
        <MotionHeading as="h2" className={styles.heading} lines={["FEATURED PROJECTS"]} />
      </div>

      <div className={styles.list}>
        {featured.map((project, i) => (
          <ProjectReveal key={project.id} project={project} index={i} />
        ))}
      </div>

      <div className={styles.footer}>
        <a href="/projects" className={styles.allLink} data-cursor="interactive">
          ALL PROJECTS →
        </a>
      </div>
    </section>
  )
}

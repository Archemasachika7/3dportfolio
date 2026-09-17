import MotionHeading from "../MotionHeading"
import MotionMedia from "../MotionMedia"
import ProjectReveal from "./ProjectReveal"
import styles from "./FeaturedProjects.module.css"

export default function FeaturedProjects({ projects = [], media = {} }) {
  return (
    <section className={styles.section} aria-label="Featured projects">
      <div className={styles.intro}>
        <span className="label">04 / SELECTED WORK</span>
        <MotionHeading as="h2" className={styles.heading} lines={["FEATURED PROJECTS"]} />
      </div>

      {projects.length === 0 ? (
        <p className={styles.empty}>No published projects yet.</p>
      ) : (
        <div className={styles.list}>
          {projects.map((project, i) => (
            <ProjectReveal key={project.id} project={project} index={i} />
          ))}
        </div>
      )}

      <div className={styles.bridge}>
        <MotionMedia
          media={media?.integrated}
          fallbackSrc="/images/bridge/integrated-solutions.png"
          className={styles.bridgeImg}
        />
        <span className={styles.bridgeLabel}>WHAT CONNECTS THESE DISCIPLINES — INTEGRATED SOLUTIONS</span>
      </div>

      <div className={styles.footer}>
        <a href="/work" className={styles.allLink} data-cursor="interactive">
          ALL WORK →
        </a>
      </div>
    </section>
  )
}

import { getProfile, getEducation, getAchievements } from "../../lib/queries"
import styles from "./about.module.css"

export const revalidate = 60

export const metadata = {
  title: "About | Archishman Das",
  description: "Bio, education, current focus, and achievements."
}

function yearRange(item) {
  if (!item.start_year) return null
  return item.end_year ? `${item.start_year} — ${item.end_year}` : `${item.start_year} — PRESENT`
}

export default async function AboutPage() {
  const [profile, education, achievements] = await Promise.all([
    getProfile(),
    getEducation(),
    getAchievements()
  ])

  return (
    <section className={styles.section} aria-label="About">
      <div className={styles.intro}>
        <span className="label">ABOUT</span>
        <h1 className={styles.heading}>{profile?.name || "ARCHISHMAN DAS"}</h1>
        {profile?.headline && <p className={styles.headline}>{profile.headline}</p>}
      </div>

      {(profile?.long_bio || profile?.short_bio) && (
        <div className={styles.block}>
          <span className="label">BIO</span>
          <p className={styles.bio}>{profile.long_bio || profile.short_bio}</p>
        </div>
      )}

      <div className={styles.block}>
        <span className="label">EDUCATION</span>
        {education.length === 0 ? (
          <p className={styles.empty}>Awaiting content.</p>
        ) : (
          <ul className={styles.educationList}>
            {education.map((item) => (
              <li key={item.id} className={styles.educationItem}>
                <span className={styles.educationInstitution}>{item.institution}</span>
                <span className={styles.educationMeta}>
                  {[item.degree, item.field].filter(Boolean).join(" — ")}
                  {yearRange(item) ? ` · ${yearRange(item)}` : ""}
                  {item.cgpa ? ` · CGPA ${item.cgpa}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.block}>
        <span className="label">CURRENT FOCUS</span>
        <p className={styles.focus}>ENGINEERING · DATA · COMPUTATION · BUSINESS</p>
        {profile?.current_status && <p className={styles.status}>{profile.current_status}</p>}
      </div>

      <div className={styles.block}>
        <span className="label">ACHIEVEMENTS</span>
        {achievements.length === 0 ? (
          <p className={styles.empty}>Awaiting content.</p>
        ) : (
          <ul className={styles.achievementList}>
            {achievements.map((item) => (
              <li key={item.id} className={styles.achievementItem}>
                <div>
                  <span className={styles.achievementTitle}>{item.title}</span>
                  {item.description && (
                    <span className={styles.achievementDescription}>{item.description}</span>
                  )}
                </div>
                <div className={styles.achievementMeta}>
                  {item.value && <span className={styles.achievementValue}>{item.value}</span>}
                  {item.year && <span className="label">{item.year}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.block}>
        <span className="label">CONTACT</span>
        <div className={styles.contactLinks}>
          {profile?.email && (
            <a href={`mailto:${profile.email}`} className={styles.actionLink} data-cursor="interactive">
              EMAIL
            </a>
          )}
          <a href="/resume" className={styles.actionLink} data-cursor="interactive">
            RESUME
          </a>
          <a href="/certificates" className={styles.actionLink} data-cursor="interactive">
            CERTIFICATES
          </a>
        </div>
      </div>
    </section>
  )
}

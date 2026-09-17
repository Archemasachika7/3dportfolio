import MapExplorer from "../../components/map/MapExplorer"
import { getDomainNodes } from "../../lib/queries"
import styles from "./map.module.css"

export const revalidate = 60

export const metadata = {
  title: "Map | Archishman Das",
  description: "Interactive career map — select a domain to see matching work and resume."
}

export default async function MapPage() {
  const { primary, lens } = await getDomainNodes()

  return (
    <section className={styles.section} aria-label="Career map">
      <div className={styles.intro}>
        <span className="label">MAP</span>
        <h1 className={styles.heading}>THE CAREER MAP</h1>
        <p className={styles.subheading}>
          Select a domain, then narrow by role if you like — the work and resume below update to match.
        </p>
      </div>

      {primary.length === 0 ? (
        <p className={styles.empty}>Career map — awaiting content.</p>
      ) : (
        <MapExplorer primary={primary} lens={lens} />
      )}
    </section>
  )
}

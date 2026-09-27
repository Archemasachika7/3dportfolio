import { Suspense } from "react"
import MapExplorer from "../../components/map/MapExplorer"
import { getDomainNodes } from "../../lib/queries"
import PageIntro from "../../components/motion/PageIntro"
import SheetLabel from "../../components/motion/SheetLabel"
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
      <PageIntro className={styles.intro}>
        <SheetLabel index="02" label="MAP" />
        <h1 className={styles.heading} data-intro-heading><span>THE CAREER MAP</span></h1>
        <p className={styles.subheading} data-intro-item style={{ "--d": 0 }}>
          Select a domain, then narrow by role if you like — the work and resume below update to match.
        </p>
      </PageIntro>

      {primary.length === 0 ? (
        <p className={styles.empty}>Career map — awaiting content.</p>
      ) : (
        // MapExplorer reads ?node= to deep link, so it needs a Suspense
        // boundary on this statically rendered page.
        <Suspense fallback={null}>
          <MapExplorer primary={primary} lens={lens} />
        </Suspense>
      )}
    </section>
  )
}

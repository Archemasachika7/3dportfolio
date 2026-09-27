import { getPublishedModels } from "../../lib/queries"
import CadWorkbench from "../../components/cad/CadWorkbench"
import Reveal from "../../components/motion/Reveal"
import PageIntro from "../../components/motion/PageIntro"
import SheetLabel from "../../components/motion/SheetLabel"
import styles from "./viewer.module.css"

export const revalidate = 60

export const metadata = {
  title: "CAD Viewer | Archishman Das",
  description:
    "Open STEP, IGES, STL, OBJ, GLB and other 3D models directly in the browser — orbit, inspect and measure without installing CAD software."
}

export default async function ViewerPage() {
  const samples = await getPublishedModels()

  return (
    <article className={styles.article}>
      <PageIntro as="header" className={styles.header}>
        <SheetLabel index="03" label="CAD VIEWER" />
        <h1 className={styles.title} data-intro-heading><span>CAD Viewer</span></h1>
        <p className={styles.lede} data-intro-item style={{ "--d": 0 }}>
          Open a CAD or 3D model straight in the browser — no install, no upload. STEP and IGES are
          tessellated locally with OpenCascade; mesh formats render directly.
        </p>
      </PageIntro>

      <Reveal style={{ display: "contents" }}>
        <div data-reveal>
          <CadWorkbench samples={samples} />
        </div>

        <section className={styles.notes}>
          <div className={styles.note} data-reveal>
            <span className="label">CONTROLS</span>
            <p>Drag to orbit · scroll to zoom · right-drag to pan. FIT reframes the part.</p>
          </div>
          <div className={styles.note} data-reveal>
            <span className="label">PRIVACY</span>
            <p>
              Files you open are read in your browser and never leave your machine. Only models
              published on this site are fetched over the network.
            </p>
          </div>
          <div className={styles.note} data-reveal>
            <span className="label">NATIVE FILES</span>
            <p>
              SolidWorks, Inventor, CATIA and Fusion files are proprietary containers no browser can
              read. Export to STEP or STL first.
            </p>
          </div>
        </section>
      </Reveal>
    </article>
  )
}

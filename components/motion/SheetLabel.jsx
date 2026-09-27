import styles from "./SectionHeader.module.css"

/**
 * The homepage's section label, for a page intro:
 *
 *   01  /  WORK  ──────────────────────────────●
 *
 * Inside a <PageIntro> it plays in order — index, typed label, the scale
 * rule drawing out, then the terminal node (CSS, app/globals.css).
 */
export default function SheetLabel({ index, label }) {
  return (
    <div className={styles.row}>
      <span className={styles.index} data-sheet-index>
        {index}
      </span>
      <span className={styles.slash} aria-hidden="true">
        /
      </span>
      <span className={styles.label} aria-label={label}>
        {Array.from(label).map((c, i) => (
          <span key={i} data-char style={{ "--i": i }} aria-hidden="true">
            {c === " " ? " " : c}
          </span>
        ))}
      </span>
      <span className={styles.rule} data-rule data-side="right" aria-hidden="true" />
      <span className={styles.node} data-node aria-hidden="true" />
    </div>
  )
}

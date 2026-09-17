import styles from "./SiteFooter.module.css"

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <span className={styles.mark}>ARCHISHMAN DAS</span>
      <nav className={styles.links} aria-label="Footer">
        <a href="#" data-cursor="interactive">GITHUB</a>
        <a href="#" data-cursor="interactive">LINKEDIN</a>
        <a href="mailto:beingthebestarche@gmail.com" data-cursor="interactive">EMAIL</a>
        <a href="/certificates" data-cursor="interactive">CERTIFICATES</a>
      </nav>
    </footer>
  )
}

import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>&copy; {new Date().getFullYear()} Cosplay is Fun</p>
        <p className={styles.made}>Сделано с любовью к косплею</p>
      </div>
    </footer>
  )
}

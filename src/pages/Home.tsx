import { Link } from 'react-router-dom'
import styles from './Home.module.css'

export function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Cosplay is Fun</h1>
        <p className={styles.subtitle}>
          Планируй косплей-проекты, общайся с единомышленниками,<br />
          делись фотографиями и вдохновляйся
        </p>
        <div className={styles.actions}>
          <Link to="/auth" className={styles.primaryBtn}>Начать</Link>
          <Link to="/social" className={styles.secondaryBtn}>Лента</Link>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Возможности</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>📋 Планировщик</h3>
            <p>Создавай проекты, ставь дедлайны, отслеживай бюджет и прогресс</p>
          </div>
          <div className={styles.card}>
            <h3>📸 Галерея</h3>
            <p>Загружай фото косплеев, собирай портфолио</p>
          </div>
          <div className={styles.card}>
            <h3>💬 Лента</h3>
            <p>Делись успехами, находи друзей, обсуждай косплей</p>
          </div>
        </div>
      </section>
    </div>
  )
}

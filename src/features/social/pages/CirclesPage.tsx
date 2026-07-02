import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCircles } from '../hooks/useCircles'
import styles from './SocialPage.module.css'

export function CirclesPage() {
  const { user } = useAuth()
  const { circles, loading } = useCircles(user?.uid)

  if (loading) return <div className={styles.page}>Загрузка...</div>
  if (!user) return <div className={styles.page}>Авторизуйтесь</div>

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Круги</h2>
        <Link to="/social/circles/new" className={styles.createBtn}>+ Создать круг</Link>
      </div>

      <div className={styles.list}>
        {circles.length === 0 && (
          <p className={styles.empty}>У вас пока нет кругов</p>
        )}

        {circles.map((circle) => (
          <Link key={circle.id} to={`/social/circles/${circle.id}`} className={styles.card}>
            <div
              className={styles.circleAvatar}
              style={circle.avatarURL ? { backgroundImage: `url(${circle.avatarURL})`, backgroundSize: 'cover' } : undefined}
            >
              {!circle.avatarURL && circle.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.circleInfo}>
              <span className={styles.circleName}>{circle.name}</span>
              <span className={styles.circleMeta}>{circle.memberCount} участников</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCircles } from '../hooks/useCircles'
import { getPublicCircles } from '../services/circlesService'
import { PageShell } from '@/components/ui/PageShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { CircleAvatar } from '@/components/ui/CircleAvatar'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Circle } from '../types'
import styles from './SocialPage.module.css'

export function CirclesPage() {
  const { user } = useAuth()
  const { circles: myCircles, loading: myLoading } = useCircles(user?.uid)
  const [publicCircles, setPublicCircles] = useState<Circle[]>([])
  const [pubLoading, setPubLoading] = useState(true)

  useEffect(() => {
    getPublicCircles().then((c) => { setPublicCircles(c); setPubLoading(false) })
  }, [])

  const myIds = new Set(myCircles.map((c) => c.id))
  const otherPublic = publicCircles.filter((c) => !myIds.has(c.id))

  return (
    <PageShell loading={myLoading || pubLoading} requiredAuth isAuthenticated={!!user}>
      <PageHeader title="Круги" action={{ label: '+ Создать круг', to: '/social/circles/new' }} />

      {/* Мои круги */}
      {myCircles.length > 0 && (
        <section>
          <h3 className={styles.sectionTitle}>Мои круги</h3>
          <div className={styles.circleGrid}>
            {myCircles.map((circle) => (
              <CircleCard key={circle.id} circle={circle} />
            ))}
          </div>
        </section>
      )}

      {/* Все публичные круги */}
      <section style={{ marginTop: myCircles.length > 0 ? 'var(--spacing-xl)' : 0 }}>
        <h3 className={styles.sectionTitle}>Все круги</h3>
        {otherPublic.length === 0 && <EmptyState message="Публичных кругов пока нет" />}
        <div className={styles.circleGrid}>
          {otherPublic.map((circle) => (
            <CircleCard key={circle.id} circle={circle} />
          ))}
        </div>
      </section>
    </PageShell>
  )
}

function CircleCard({ circle }: { circle: Circle }) {
  return (
    <Link to={`/social/circles/${circle.id}`} className={styles.circleCard}>
      <CircleAvatar name={circle.name} url={circle.avatarURL} size="card" />
      <div className={styles.circleCardBody}>
        <div className={styles.circleCardNameRow}>
          <span className={styles.circleCardName}>{circle.name}</span>
          {circle.isPrivate && <span className={styles.privateBadge}>Приватный</span>}
        </div>
        {circle.description && <p className={styles.circleCardDesc}>{circle.description}</p>}
        <span className={styles.circleMeta}>{circle.memberCount} участников</span>
      </div>
    </Link>
  )
}

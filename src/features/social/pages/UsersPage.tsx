import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { UserPreview } from '../components/UserPreview'
import { FriendButton } from '../components/FriendButton'
import { getDocs, collection } from 'firebase/firestore'
import { getFirebaseDb } from '@/services/firebase'
import { PageShell } from '@/components/ui/PageShell'
import { EmptyState } from '@/components/ui/EmptyState'
import type { UserProfile } from '@/types'
import styles from './SocialPage.module.css'

export function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const db = getFirebaseDb()
    getDocs(collection(db, 'users'))
      .then((snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserProfile))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <PageShell loading={loading}>
      <h2 className={styles.title}>Участники проекта</h2>

      <div className={styles.grid}>
        {!loading && users.length === 0 && <EmptyState message="Пока нет участников" />}

        {users.filter((p) => p.id !== user?.uid).map((p) => (
          <div key={p.id} className={styles.userCard}>
            <div className={styles.userCardLink}>
              <UserPreview uid={p.id} size={56} />
            </div>
            <FriendButton targetUid={p.id} />
          </div>
        ))}
      </div>
    </PageShell>
  )
}

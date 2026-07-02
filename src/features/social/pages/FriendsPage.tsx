import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { UserPreview } from '../components/UserPreview'
import { useFriends } from '../hooks/useFriends'
import { acceptFriendRequest, removeFriendship } from '../services/friendsService'
import { PageShell } from '@/components/ui/PageShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import styles from './SocialPage.module.css'

type Tab = 'friends' | 'incoming' | 'outgoing'

export function FriendsPage() {
  const { user } = useAuth()
  const { friends, incoming, outgoing, loading } = useFriends(user?.uid)
  const [tab, setTab] = useState<Tab>('friends')

  if (!user) return <PageShell requiredAuth isAuthenticated={false} />

  async function handleAccept(friendId: string) {
    if (!user) return
    await acceptFriendRequest(user.uid, friendId)
    window.location.reload()
  }

  async function handleRemove(friendId: string) {
    if (!user) return
    await removeFriendship(user.uid, friendId)
    window.location.reload()
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'friends', label: 'Друзья', count: friends.length },
    { key: 'incoming', label: 'Входящие', count: incoming.length },
    { key: 'outgoing', label: 'Исходящие', count: outgoing.length },
  ]

  const currentList = tab === 'friends' ? friends : tab === 'incoming' ? incoming : outgoing

  return (
    <PageShell loading={loading}>
      <PageHeader title="Друзья" action={{ label: '+ Найти людей', to: '/social/friends/find' }} />

      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.activeTab : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.count > 0 && <span className={styles.badge}>{t.count}</span>}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {currentList.length === 0 && (
          <EmptyState
            message={tab === 'friends' ? 'Пока нет друзей' : tab === 'incoming' ? 'Нет входящих заявок' : 'Нет исходящих заявок'}
          />
        )}

        {currentList.map((item) => (
          <div key={item.friendId} className={styles.card}>
            <div className={styles.cardLink}>
              <UserPreview uid={item.friendId} />
            </div>
            <div className={styles.cardActions}>
              {item.relation === 'subscriber' && (
                <button className={styles.acceptBtn} onClick={() => handleAccept(item.friendId)}>Принять</button>
              )}
              <button className={styles.removeBtn} onClick={() => handleRemove(item.friendId)}>
                {item.relation === 'friend' ? 'Удалить' : 'Отклонить'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}

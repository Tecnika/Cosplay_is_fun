import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { UserPreview } from '../components/UserPreview'
import { useFriends } from '../hooks/useFriends'
import { acceptFriendRequest, removeFriendship } from '../services/friendsService'
import styles from './SocialPage.module.css'

type Tab = 'friends' | 'incoming' | 'outgoing'

export function FriendsPage() {
  const { user } = useAuth()
  const { friends, incoming, outgoing, loading } = useFriends(user?.uid)
  const [tab, setTab] = useState<Tab>('friends')

  if (loading) return <div className={styles.page}>Загрузка...</div>
  if (!user) return <div className={styles.page}>Авторизуйтесь</div>

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
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Друзья</h2>
        <Link to="/social/friends/find" className={styles.createBtn}>+ Найти людей</Link>
      </div>

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
          <p className={styles.empty}>
            {tab === 'friends' ? 'Пока нет друзей' :
             tab === 'incoming' ? 'Нет входящих заявок' :
             'Нет исходящих заявок'}
          </p>
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
    </div>
  )
}

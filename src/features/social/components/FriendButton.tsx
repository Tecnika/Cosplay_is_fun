import { useAuth } from '@/features/auth/hooks/useAuth'
import { useFriendship } from '../hooks/useFriendship'
import type { FriendRelation } from '../types'
import styles from './FriendButton.module.css'

interface FriendButtonProps {
  targetUid: string
}

const LABELS: Record<FriendRelation, string> = {
  none: '➕ В друзья',
  subscribed: '⏳ Запрос отправлен',
  subscriber: '✅ Принять заявку',
  friend: '👥 Вы друзья',
}

export function FriendButton({ targetUid }: FriendButtonProps) {
  const { user } = useAuth()
  const { relation, loading, sendRequest, acceptRequest, removeFriend } = useFriendship(user?.uid, targetUid)

  if (loading || !user || user.uid === targetUid) return null

  async function handleClick() {
    switch (relation) {
      case 'none':
        await sendRequest()
        break
      case 'subscriber':
        await acceptRequest()
        break
      case 'friend':
        await removeFriend()
        break
      // subscribed — ничего не делаем
    }
  }

  return (
    <button
      className={`${styles.btn} ${styles[relation]}`}
      onClick={handleClick}
      disabled={relation === 'subscribed'}
    >
      {LABELS[relation]}
    </button>
  )
}

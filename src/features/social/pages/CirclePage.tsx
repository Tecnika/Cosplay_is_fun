import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { UserPreview } from '../components/UserPreview'
import { getCircle, getCircleMembers, joinCircle, leaveCircle, deleteCircle, getMemberRole } from '../services/circlesService'
import type { Circle, CircleMember, CircleRole } from '../types'
import styles from './SocialPage.module.css'

export function CirclePage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const [circle, setCircle] = useState<Circle | null>(null)
  const [members, setMembers] = useState<CircleMember[]>([])
  const [myRole, setMyRole] = useState<CircleRole | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return

    let cancelled = false
    async function load() {
      const [c, m] = await Promise.all([getCircle(id), getCircleMembers(id)])
      if (!cancelled) {
        setCircle(c)

        setMembers(m)

        if (user) {
          const role = await getMemberRole(id, user.uid)
          setMyRole(role)
        }
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, user])

  if (loading) return <div className={styles.page}>Загрузка...</div>
  if (!circle) return <div className={styles.page}>Круг не найден</div>

  async function handleJoin() {
    if (!id || !user) return
    await joinCircle(id, user.uid, profile?.displayName || 'Пользователь')
    setMyRole('subscriber')
    setMembers(await getCircleMembers(id))
  }

  async function handleLeave() {
    if (!id || !user) return
    await leaveCircle(id, user.uid)
    setMyRole(null)
    setMembers(await getCircleMembers(id))
  }

  async function handleDelete() {
    if (!id || !user) return
    if (!confirm('Удалить круг? Это действие необратимо.')) return
    await deleteCircle(id, user.uid)
    navigate('/social/circles', { replace: true })
  }

  const isMember = myRole !== null
  const canEdit = myRole === 'creator'

  return (
    <div className={styles.page}>
      {/* Обложка */}
      {circle.coverURL && (
        <div
          className={styles.cover}
          style={{ backgroundImage: `url(${circle.coverURL})` }}
        />
      )}

      <div className={styles.circleHeader}>
        <div
          className={styles.circleBigAvatar}
          style={circle.avatarURL ? { backgroundImage: `url(${circle.avatarURL})`, backgroundSize: 'cover' } : undefined}
        >
          {!circle.avatarURL && circle.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.circleHeaderInfo}>
          <h2 className={styles.title}>{circle.name}</h2>
          {circle.description && <p className={styles.circleDesc}>{circle.description}</p>}
          {circle.contacts && <p className={styles.circleContacts}>{circle.contacts}</p>}
          <span className={styles.circleMeta}>{circle.memberCount} участников</span>
        </div>
        <div className={styles.circleActions}>
          {!isMember ? (
            <button className={styles.joinBtn} onClick={handleJoin}>Вступить</button>
          ) : canEdit ? (
            <>
              <span className={styles.roleBadge}>Создатель</span>
              <Link to={`/social/circles/${id}/settings`} className={styles.createBtn}>Настройки</Link>
              <button className={styles.leaveBtn} onClick={handleDelete}>Удалить круг</button>
            </>
          ) : (
            <button className={styles.leaveBtn} onClick={handleLeave}>Покинуть</button>
          )}
        </div>
      </div>

      <h3 className={styles.sectionTitle}>Участники</h3>
      <div className={styles.list}>
        {members.map((m) => (
          <div key={m.uid} className={styles.memberCard}>
            <div className={styles.memberInfo}>
              <UserPreview uid={m.uid} size={36} />
              {m.role !== 'subscriber' && (
                <span className={styles.roleBadge}>
                  {m.role === 'creator' ? 'Создатель' : 'Модератор'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

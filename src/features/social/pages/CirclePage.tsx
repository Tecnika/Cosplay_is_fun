import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { UserPreview } from '../components/UserPreview'
import { getCircle, getCircleMembers, joinCircle, leaveCircle, deleteCircle, getMemberRole, createInvite } from '../services/circlesService'
import { PageShell } from '@/components/ui/PageShell'
import { CircleAvatar } from '@/components/ui/CircleAvatar'
import { useAsyncEffect } from '@/hooks/useAsyncEffect'
import type { Circle, CircleMember, CircleRole } from '../types'
import styles from './SocialPage.module.css'

export function CirclePage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [circle, setCircle] = useState<Circle | null>(null)
  const [members, setMembers] = useState<CircleMember[]>([])
  const [myRole, setMyRole] = useState<CircleRole | null>(null)
  const [loading, setLoading] = useState(true)
  useAsyncEffect(async () => {
    if (!id) return
    const [c, m] = await Promise.all([getCircle(id), getCircleMembers(id)])
    if (c) setCircle(c)
    setMembers(m)
    if (user) {
      const role = await getMemberRole(id, user.uid)
      setMyRole(role)
    }
    setLoading(false)
  }, [id, user])

  if (!circle) return <PageShell loading={loading}>Круг не найден</PageShell>

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

  async function handleInvite() {
    if (!id || !user) return
    try {
      const code = await createInvite(id, user.uid)
      const link = `${window.location.origin}/Cosplay_is_fun/social/circles/join/${code}`
      await navigator.clipboard.writeText(link)
      alert('Ссылка-приглашение скопирована!')
    } catch {
      alert('Ошибка создания приглашения')
    }
  }

  const isMember = myRole !== null
  const canEdit = myRole === 'creator'

  return (
    <PageShell>
      {circle.coverURL && (
        <div className={styles.cover} style={{ backgroundImage: `url(${circle.coverURL})` }} />
      )}

      <div className={styles.circleHeader}>
        <CircleAvatar name={circle.name} url={circle.avatarURL} size="detail" />
        <div className={styles.circleHeaderInfo}>
          <div className={styles.circleTitleRow}>
            <h2 className={styles.title}>{circle.name}</h2>
            {circle.isPrivate && <span className={styles.privateBadge}>Приватный</span>}
          </div>
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
              <button className={styles.createBtn} onClick={handleInvite}>Пригласить</button>
              <Link to={`/social/circles/${id}/settings`} className={styles.createBtn}>Настройки</Link>
              <button className={styles.leaveBtn} onClick={handleDelete}>Удалить круг</button>
            </>
          ) : (
            <>
              <button className={styles.leaveBtn} onClick={handleLeave}>Покинуть</button>
              <button className={styles.createBtn} onClick={handleInvite}>Пригласить</button>
            </>
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
    </PageShell>
  )
}

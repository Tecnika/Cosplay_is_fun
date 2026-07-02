import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getCircleByInviteCode, joinCircle } from '../services/circlesService'
import { PageShell } from '@/components/ui/PageShell'
import type { Circle } from '../types'

export function CircleJoinPage() {
  const { code } = useParams<{ code: string }>()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [circle, setCircle] = useState<Circle | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!code) return
    getCircleByInviteCode(code).then((c) => {
      setCircle(c)
      setLoading(false)
    })
  }, [code])

  async function handleJoin() {
    if (!circle || !user) return
    setJoining(true)
    setError('')
    try {
      await joinCircle(circle.id, user.uid, profile?.displayName || 'Пользователь')
      navigate(`/social/circles/${circle.id}`, { replace: true })
    } catch {
      setError('Ошибка вступления в круг')
    } finally {
      setJoining(false)
    }
  }

  if (loading) return <PageShell loading>Загрузка...</PageShell>
  if (!circle) return <PageShell>Ссылка-приглашение недействительна</PageShell>
  if (!user) return <PageShell requiredAuth isAuthenticated={false} />

  return (
    <PageShell>
      <h2>Приглашение в круг</h2>
      <p>Вас приглашают вступить в круг «{circle.name}»</p>
      {error && <p style={{ color: 'var(--color-error)' }}>{error}</p>}
      <button onClick={handleJoin} disabled={joining}>
        {joining ? 'Вступление...' : 'Вступить'}
      </button>
    </PageShell>
  )
}

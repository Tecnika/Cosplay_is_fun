import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useProject } from '../hooks/useProject'
import { updateProject } from '../services/projectService'
import { PageShell } from '@/components/ui/PageShell'
import styles from './ProjectNewPage.module.css'

export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { project, loading } = useProject(id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (project) {
      setTitle(project.title)
      setDescription(project.description || '')
      setDeadline(project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '')
    }
  }, [project])

  if (!user) return <PageShell requiredAuth isAuthenticated={false} />
  if (loading) return <PageShell loading />
  if (!project) return <PageShell><div>Проект не найден</div></PageShell>
  if (project.ownerId !== user.uid) return <PageShell><div>Только владелец может редактировать</div></PageShell>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !id) return
    setSaving(true)
    setError('')
    try {
      const updates: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || undefined,
      }
      if (deadline) {
        updates.deadline = new Date(deadline).getTime()
      }
      await updateProject(id, updates)
      navigate(`/planner/project/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={`/planner/project/${id}`} className={styles.backLink}>← Назад</Link>
        <h1 className={styles.title}>Редактировать проект</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Название *</span>
            <input className={styles.input} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Описание</span>
            <textarea className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Дедлайн</span>
            <input className={styles.input} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.submit} disabled={saving || !title.trim()}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </PageShell>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { createProject } from '../services/projectService'
import { PageShell } from '@/components/ui/PageShell'
import styles from './ProjectNewPage.module.css'

export function ProjectNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'personal' | 'group'>('personal')
  const [isPublic, setIsPublic] = useState(false)
  const [deadline, setDeadline] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!user) return <PageShell requiredAuth isAuthenticated={false} />
  const currentUser = user

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      const data: Record<string, unknown> = {
        title: title.trim(),
        type,
        isPublic,
        ownerId: currentUser.uid,
        members: [currentUser.uid],
        createdAt: Date.now(),
      }
      if (description.trim()) {
        data.description = description.trim()
      }
      if (deadline) {
        data.deadline = new Date(deadline).getTime()
      }
      const id = await createProject(data as Parameters<typeof createProject>[0])
      navigate(`/planner/project/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания проекта')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to="/planner" className={styles.backLink}>← Назад</Link>
        <h1 className={styles.title}>Новый проект</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Название *</span>
            <input className={styles.input} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название проекта" required />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Описание</span>
            <textarea className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание проекта" rows={3} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Дедлайн</span>
            <input className={styles.input} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>Тип проекта</span>
              <select className={styles.select} value={type} onChange={(e) => setType(e.target.value as 'personal' | 'group')}>
                <option value="personal">Личный (один образ)</option>
                <option value="group">Групповой (несколько образов + участники)</option>
              </select>
            </label>
            <label className={styles.checkField}>
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              <span>Публичный проект</span>
            </label>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.submit} disabled={saving || !title.trim()}>
            {saving ? 'Создание...' : 'Создать проект'}
          </button>
        </form>
      </div>
    </PageShell>
  )
}

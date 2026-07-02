import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { createCircle } from '../services/circlesService'
import styles from './SocialPage.module.css'

export function CircleNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (name.length < 2) { setError('Название минимум 2 символа'); return }
    setSaving(true)
    setError('')

    try {
      const id = await createCircle(name, description, user.uid)
      navigate(`/social/circles/${id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Создать круг</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.field}>
          <span>Название *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Косплееры СПб" required />
        </label>

        <label className={styles.field}>
          <span>Описание</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="О чём ваше сообщество" rows={4} />
        </label>

        <button className={styles.submitBtn} disabled={saving}>
          {saving ? 'Создание...' : 'Создать круг'}
        </button>
      </form>
    </div>
  )
}

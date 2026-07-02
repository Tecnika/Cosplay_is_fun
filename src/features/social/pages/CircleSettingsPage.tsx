import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getCircle, updateCircle } from '../services/circlesService'
import type { Circle } from '../types'
import styles from './SocialPage.module.css'

export function CircleSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [circle, setCircle] = useState<Circle | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [contacts, setContacts] = useState('')
  const [avatarURL, setAvatarURL] = useState('')
  const [coverURL, setCoverURL] = useState('')

  useEffect(() => {
    if (!id) return
    getCircle(id).then((c) => {
      if (!c) return
      setCircle(c)
      setName(c.name)
      setDescription(c.description || '')
      setContacts(c.contacts || '')
      setAvatarURL(c.avatarURL || '')
      setCoverURL(c.coverURL || '')
      setLoading(false)
    })
  }, [id])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!id || !user || !circle) return
    if (name.length < 2) { setError('Название минимум 2 символа'); return }

    setSaving(true)
    setError('')
    try {
      await updateCircle(id, user.uid, {
        name,
        description,
        contacts,
        avatarURL: avatarURL || undefined,
        coverURL: coverURL || undefined,
      })
      navigate(`/social/circles/${id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className={styles.page}>Загрузка...</div>
  if (!circle) return <div className={styles.page}>Круг не найден</div>

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Настройки круга</h2>

      <form className={styles.form} onSubmit={handleSave}>
        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.field}>
          <span>Название *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label className={styles.field}>
          <span>Описание</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </label>

        <label className={styles.field}>
          <span>Контакты</span>
          <textarea value={contacts} onChange={(e) => setContacts(e.target.value)} rows={3} placeholder="Ссылки, соцсети, способы связи" />
        </label>

        <label className={styles.field}>
          <span>Аватар (URL)</span>
          <input value={avatarURL} onChange={(e) => setAvatarURL(e.target.value)} placeholder="https://example.com/avatar.jpg" />
        </label>

        <label className={styles.field}>
          <span>Обложка (URL)</span>
          <input value={coverURL} onChange={(e) => setCoverURL(e.target.value)} placeholder="https://example.com/cover.jpg" />
        </label>

        <button className={styles.submitBtn} disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  )
}

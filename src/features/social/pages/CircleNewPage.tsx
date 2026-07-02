import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { createCircle } from '../services/circlesService'
import { PageShell } from '@/components/ui/PageShell'
import { FormError } from '@/components/ui/FormError'
import { SubmitButton } from '@/components/ui/SubmitButton'
import styles from './SocialPage.module.css'

export function CircleNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (name.length < 2) { setError('Название минимум 2 символа'); return }
    setSaving(true)
    setError('')

    try {
      const id = await createCircle(name, description, user.uid, isPrivate)
      navigate(`/social/circles/${id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell>
      <h2 className={styles.title}>Создать круг</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <FormError message={error} />

        <label className={styles.field}>
          <span>Название *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Косплееры СПб" required />
        </label>

        <label className={styles.field}>
          <span>Описание</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="О чём ваше сообщество" rows={4} />
        </label>

        <label className={styles.field}>
          <span>Тип круга</span>
          <div className={styles.toggleRow}>
            <button type="button" className={!isPrivate ? styles.toggleActive : styles.togglePassive} onClick={() => setIsPrivate(false)}>Публичный</button>
            <button type="button" className={isPrivate ? styles.toggleActive : styles.togglePassive} onClick={() => setIsPrivate(true)}>Приватный</button>
          </div>
          <span className={styles.fieldHint}>
            {isPrivate
              ? 'Приватный — вступить можно только по приглашению'
              : 'Публичный — любой может вступить'}
          </span>
        </label>

        <SubmitButton loading={saving} loadingText="Создание...">Создать круг</SubmitButton>
      </form>
    </PageShell>
  )
}

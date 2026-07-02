import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getCircle, updateCircle, createInvite } from '../services/circlesService'
import { PageShell } from '@/components/ui/PageShell'
import { FormError } from '@/components/ui/FormError'
import { SubmitButton } from '@/components/ui/SubmitButton'
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
  const [isPrivate, setIsPrivate] = useState(false)

  const [inviteCode, setInviteCode] = useState('')
  const [inviteLink, setInviteLink] = useState('')

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
      setIsPrivate(c.isPrivate)
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
        name, description, contacts, isPrivate,
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

  async function handleGenerateInvite() {
    if (!id || !user) return
    try {
      const code = await createInvite(id, user.uid)
      setInviteCode(code)
      setInviteLink(`${window.location.origin}/Cosplay_is_fun/social/circles/join/${code}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка генерации')
    }
  }

  async function handleCopyLink() {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink)
      alert('Ссылка скопирована!')
    }
  }

  return (
    <PageShell loading={loading}>
      <h2 className={styles.title}>Настройки круга</h2>

      <form className={styles.form} onSubmit={handleSave}>
        <FormError message={error} />

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
          <span>Тип круга</span>
          <div className={styles.toggleRow}>
            <button type="button" className={!isPrivate ? styles.toggleActive : styles.togglePassive} onClick={() => setIsPrivate(false)}>Публичный</button>
            <button type="button" className={isPrivate ? styles.toggleActive : styles.togglePassive} onClick={() => setIsPrivate(true)}>Приватный</button>
          </div>
        </label>

        <label className={styles.field}>
          <span>Аватар (URL)</span>
          <input value={avatarURL} onChange={(e) => setAvatarURL(e.target.value)} placeholder="https://example.com/avatar.jpg" />
        </label>

        <label className={styles.field}>
          <span>Обложка (URL)</span>
          <input value={coverURL} onChange={(e) => setCoverURL(e.target.value)} placeholder="https://example.com/cover.jpg" />
        </label>

        <SubmitButton loading={saving}>Сохранить</SubmitButton>
      </form>

      {/* Приглашения */}
      <div style={{ marginTop: 'var(--spacing-xl)' }}>
        <h3 className={styles.sectionTitle}>Приглашения</h3>
        <div className={styles.inviteRow}>
          <button type="button" className={styles.createBtn} onClick={handleGenerateInvite}>Создать приглашение</button>
        </div>
        {inviteCode && (
          <div className={styles.inviteResult}>
            <p className={styles.inviteLinkText}>{inviteLink}</p>
            <button type="button" className={styles.createBtn} onClick={handleCopyLink}>Копировать</button>
          </div>
        )}
      </div>
    </PageShell>
  )
}

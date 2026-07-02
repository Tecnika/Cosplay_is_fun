import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Avatar } from '../components/Avatar'
import { PrivacyBadge } from '../components/PrivacyBadge'
import { useProfile } from '../hooks/useProfile'
import { updateProfile } from '../services/profileService'
import type { PrivacyLevel } from '@/types'
import { PRIVACY_LABELS } from '../types'
import styles from './ProfilePage.module.css'

const PRIVACY_OPTIONS: PrivacyLevel[] = ['public', 'friends', 'circle', 'private']

export function ProfilePage() {
  const { user, profile: authProfile, refreshProfile } = useAuth()
  const { profile, loading } = useProfile(user?.uid)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [bio, setBio] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [privacies, setPrivacies] = useState<Record<string, PrivacyLevel>>({})

  const currentName = authProfile?.displayName || user?.displayName || 'Пользователь'
  const p = profile || authProfile

  function startEditing() {
    setFirstName(p?.firstName || '')
    setLastName(p?.lastName || '')
    setBirthDate(p?.birthDate || '')
    setBio(p?.bio || '')
    setPhotoURL(p?.photoURL || '')
    setPrivacies({
      firstName: p?.firstNamePrivacy || 'public',
      lastName: p?.lastNamePrivacy || 'public',
      birthDate: p?.birthDatePrivacy || 'public',
      bio: p?.bioPrivacy || 'public',
      photo: p?.photoPrivacy || 'public',
    })
    setEditing(true)
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaveError('')

    const data: Record<string, unknown> = {}
    if (firstName) data.firstName = firstName
    if (lastName) data.lastName = lastName
    if (birthDate) data.birthDate = birthDate
    if (bio) data.bio = bio
    if (photoURL) data.photoURL = photoURL
    data.firstNamePrivacy = privacies.firstName
    data.lastNamePrivacy = privacies.lastName
    data.birthDatePrivacy = privacies.birthDate
    data.bioPrivacy = privacies.bio
    data.photoPrivacy = privacies.photo

    try {
      await updateProfile(user.uid, data)
      await refreshProfile()
      setEditing(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  function cancelEdit() {
    setEditing(false)
  }

  if (loading) return <div className={styles.page}>Загрузка...</div>
  if (!user) return <div className={styles.page}>Авторизуйтесь для просмотра профиля</div>

  // ---------- Режим редактирования ----------
  if (editing) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h2 className={styles.title}>Редактирование профиля</h2>

          <div className={styles.editForm}>
            {editField('Фото (URL)', photoURL, setPhotoURL, 'photo')}
            {editField('Имя', firstName, setFirstName, 'firstName')}
            {editField('Фамилия', lastName, setLastName, 'lastName')}
            {editField('Дата рождения', birthDate, setBirthDate, 'birthDate', 'date')}
            {editTextArea('О себе', bio, setBio, 'bio')}

            {saveError && <div className={styles.error}>{saveError}</div>}

            <div className={styles.actions}>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button className={styles.cancelBtn} onClick={cancelEdit}>Отмена</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Просмотр профиля ----------
  const fullName = [p?.firstName, p?.lastName].filter(Boolean).join(' ')
  const formattedDate = p?.birthDate ? new Date(p.birthDate).toLocaleDateString('ru-RU') : null

  return (
    <div className={styles.page}>
      <div className={styles.profileGrid}>
        {/* Левая колонка */}
        <div className={styles.leftCol}>
          <div className={styles.avatarSection}>
            <Avatar name={currentName} url={p?.photoURL} size={120} />
            <button className={styles.editIconBtn} onClick={startEditing} title="Редактировать профиль">✏️</button>
          </div>

          <div className={styles.nickRow}>
            <h1 className={styles.nick}>{currentName}</h1>
          </div>

          {fullName && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Имя</span>
              <span className={styles.infoValue}>
                {fullName}
                <PrivacyBadge level={p?.firstNamePrivacy || 'public'} />
              </span>
            </div>
          )}

          {formattedDate && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Дата рождения</span>
              <span className={styles.infoValue}>
                {formattedDate}
                <PrivacyBadge level={p?.birthDatePrivacy || 'public'} />
              </span>
            </div>
          )}

          <div className={styles.projectsSection}>
            <h3 className={styles.sectionTitle}>Проекты</h3>
            <p className={styles.placeholder}>Создайте первый косплей-проект в Планировщике</p>
          </div>
        </div>

        {/* Правая колонка */}
        <div className={styles.rightCol}>
          {p?.bio && (
            <div className={styles.bioSection}>
              <h3 className={styles.sectionTitle}>О себе</h3>
              <p className={styles.bio}>
                {p.bio}
                <PrivacyBadge level={p?.bioPrivacy || 'public'} />
              </p>
            </div>
          )}

          <div className={styles.socialSection}>
            <h3 className={styles.sectionTitle}>Друзья и круги</h3>
            <p className={styles.placeholder}>Здесь будут друзья и круги общения</p>
          </div>
        </div>
      </div>
    </div>
  )

  // ---------- Вспомогательные функции ----------
  function editField(
    label: string,
    value: string,
    onChange: (v: string) => void,
    privacyKey: string,
    type: string = 'text',
  ) {
    return (
      <label className={styles.editField}>
        <span className={styles.editLabel}>{label}</span>
        <div className={styles.editRow}>
          <input
            className={styles.input}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
          />
          <select
            className={styles.privacySelect}
            value={privacies[privacyKey] || 'public'}
            onChange={(e) => setPrivacies({ ...privacies, [privacyKey]: e.target.value as PrivacyLevel })}
          >
            {PRIVACY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{PRIVACY_LABELS[opt]}</option>
            ))}
          </select>
        </div>
      </label>
    )
  }

  function editTextArea(label: string, value: string, onChange: (v: string) => void, privacyKey: string) {
    return (
      <label className={styles.editField}>
        <span className={styles.editLabel}>{label}</span>
        <div className={styles.editRow}>
          <textarea
            className={styles.textarea}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
            rows={3}
          />
          <select
            className={styles.privacySelect}
            value={privacies[privacyKey] || 'public'}
            onChange={(e) => setPrivacies({ ...privacies, [privacyKey]: e.target.value as PrivacyLevel })}
          >
            {PRIVACY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{PRIVACY_LABELS[opt]}</option>
            ))}
          </select>
        </div>
      </label>
    )
  }
}

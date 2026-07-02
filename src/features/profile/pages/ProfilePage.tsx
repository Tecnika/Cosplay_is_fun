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

  // Форма
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [bio, setBio] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [privacies, setPrivacies] = useState<Record<string, PrivacyLevel>>({})

  const currentName = authProfile?.displayName || user?.displayName || 'Пользователь'

  function startEditing() {
    setFirstName(profile?.firstName || '')
    setLastName(profile?.lastName || '')
    setBirthDate(profile?.birthDate || '')
    setBio(profile?.bio || '')
    setPhotoURL(profile?.photoURL || '')
    setPrivacies({
      firstName: profile?.firstNamePrivacy || 'public',
      lastName: profile?.lastNamePrivacy || 'public',
      birthDate: profile?.birthDatePrivacy || 'public',
      bio: profile?.bioPrivacy || 'public',
      photo: profile?.photoPrivacy || 'public',
    })
    setEditing(true)
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaveError('')

    // Убираем пустые строки, чтобы Firestore не ругался на undefined
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

  if (editing) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h2 className={styles.title}>Редактирование профиля</h2>

          <div className={styles.form}>
            {renderField('Фото (URL)', photoURL, setPhotoURL, 'photo')}
            {renderField('Имя', firstName, setFirstName, 'firstName')}
            {renderField('Фамилия', lastName, setLastName, 'lastName')}
            {renderField('Дата рождения', birthDate, setBirthDate, 'birthDate', 'date')}
            {renderTextArea('О себе', bio, setBio, 'bio')}

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

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Avatar name={currentName} url={profile?.photoURL} size={80} />
          <div className={styles.headerInfo}>
            <h2 className={styles.nick}>{currentName}</h2>
            <span className={styles.role}>{authProfile?.role}</span>
          </div>
          <button className={styles.editBtn} onClick={startEditing}>Редактировать</button>
        </div>

        <div className={styles.fields}>
          {renderFieldDisplay('Имя', profile?.firstName, profile?.firstNamePrivacy)}
          {renderFieldDisplay('Фамилия', profile?.lastName, profile?.lastNamePrivacy)}
          {renderFieldDisplay('Дата рождения', profile?.birthDate, profile?.birthDatePrivacy, 'date')}
          {renderFieldDisplay('О себе', profile?.bio, profile?.bioPrivacy)}
        </div>
      </div>
    </div>
  )

  function renderFieldDisplay(label: string, value: string | undefined, privacy?: PrivacyLevel, type?: string) {
    if (!value && !editing) return null
    const displayValue = type === 'date' && value ? new Date(value).toLocaleDateString('ru-RU') : value
    return (
      <div className={styles.field}>
        <span className={styles.fieldLabel}>
          {label}
          {privacy && <PrivacyBadge level={privacy} />}
        </span>
        <span className={styles.fieldValue}>{displayValue || '—'}</span>
      </div>
    )
  }

  function renderField(
    label: string,
    value: string,
    onChange: (v: string) => void,
    privacyKey: string,
    type: string = 'text',
  ) {
    return (
      <label className={styles.field}>
        <span className={styles.fieldLabel}>{label}</span>
        <div className={styles.fieldRow}>
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

  function renderTextArea(label: string, value: string, onChange: (v: string) => void, privacyKey: string) {
    return (
      <label className={styles.field}>
        <span className={styles.fieldLabel}>{label}</span>
        <div className={styles.fieldRow}>
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

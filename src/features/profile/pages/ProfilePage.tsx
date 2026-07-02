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
    try {
      await updateProfile(user.uid, {
        firstName,
        lastName,
        birthDate: birthDate || undefined,
        bio,
        photoURL: photoURL || undefined,
        firstNamePrivacy: privacies.firstName,
        lastNamePrivacy: privacies.lastName,
        birthDatePrivacy: privacies.birthDate,
        bioPrivacy: privacies.bio,
        photoPrivacy: privacies.photo,
      })
      await refreshProfile()
      setEditing(false)
    } catch (err) {
      console.error(err)
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

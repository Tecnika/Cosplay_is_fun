import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Avatar } from '../components/Avatar'
import { PrivacyBadge } from '../components/PrivacyBadge'
import { useProfile } from '../hooks/useProfile'
import { getProfileByUsername, updateProfile, isFieldVisible } from '../services/profileService'
import type { PrivacyLevel, UserProfile } from '@/types'
import { PRIVACY_LABELS } from '../types'
import styles from './ProfilePage.module.css'

const PRIVACY_OPTIONS: PrivacyLevel[] = ['public', 'friends', 'circle', 'private']

type ViewMode = 'self' | 'superadmin' | 'other'

export function ProfilePage() {
  const { username } = useParams()
  const { user, profile: myProfile, refreshProfile } = useAuth()
  const { profile: loadedProfile, loading } = useProfile(user?.uid)

  // Если открыт чужой профиль — загружаем его
  const [otherProfile, setOtherProfile] = useState<UserProfile | null>(null)
  const [otherLoading, setOtherLoading] = useState(false)

  const p = otherProfile || loadedProfile || myProfile
  const currentName = p?.displayName || user?.displayName || 'Пользователь'

  // Определяем режим просмотра
  const viewMode: ViewMode = !username
    ? 'self'
    : myProfile?.role === 'superadmin'
      ? 'superadmin'
      : 'other'

  useEffect(() => {
    if (username) {
      setOtherLoading(true)
      getProfileByUsername(username)
        .then(setOtherProfile)
        .finally(() => setOtherLoading(false))
    } else {
      setOtherProfile(null)
    }
  }, [username])

  // Редактирование
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [bio, setBio] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [privacies, setPrivacies] = useState<Record<string, PrivacyLevel>>({})

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

  function cancelEdit() { setEditing(false) }

  // Состояния загрузки
  if (loading || otherLoading) return <div className={styles.page}>Загрузка...</div>
  if (!user && !username) return <div className={styles.page}>Авторизуйтесь для просмотра профиля</div>
  if (username && !otherProfile) return <div className={styles.page}>Пользователь не найден</div>

  // ---------- Редактирование ----------
  if (editing && viewMode === 'self') {
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

  // ---------- Просмотр ----------
  const fullName = [p?.firstName, p?.lastName].filter(Boolean).join(' ')
  const formattedDate = p?.birthDate ? new Date(p.birthDate).toLocaleDateString('ru-RU') : null

  return (
    <div className={styles.page}>
      <div className={styles.profileGrid}>
        {/* Левая колонка */}
        <div className={styles.leftCol}>
          <div className={styles.avatarSection}>
            <Avatar name={currentName} url={isFieldVisible(p?.photoPrivacy, viewMode) ? p?.photoURL : undefined} size={120} />
            {viewMode === 'self' && (
              <button className={styles.editIconBtn} onClick={startEditing} title="Редактировать профиль">✏️</button>
            )}
            {viewMode === 'superadmin' && (
              <span className={styles.superadminBadge}>👁️ superadmin</span>
            )}
          </div>

          <div className={styles.nickRow}>
            <h1 className={styles.nick}>{currentName}</h1>
          </div>

          {renderField('Имя', fullName, p?.firstNamePrivacy)}
          {renderField('Дата рождения', formattedDate, p?.birthDatePrivacy)}

        </div>

        {/* Правая колонка */}
        <div className={styles.rightCol}>
          {renderBio()}

          <div className={styles.socialSection}>
            <h3 className={styles.sectionTitle}>Друзья и круги</h3>
            <p className={styles.placeholder}>Здесь будут друзья и круги общения</p>
          </div>

          <div className={styles.projectsSection}>
            <h3 className={styles.sectionTitle}>Проекты</h3>
            <p className={styles.placeholder}>
              {viewMode === 'self'
                ? 'Создайте первый косплей-проект в Планировщике'
                : 'Нет проектов'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // ---------- Вспомогательные функции ----------
  function renderField(label: string, value: string | null, privacy?: PrivacyLevel) {
    if (!value) return null
    if (!isFieldVisible(privacy, viewMode)) {
      return (
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>{label}</span>
          <span className={styles.privacyHidden}>
            🔒 {PRIVACY_LABELS[privacy || 'private']}
          </span>
        </div>
      )
    }
    return (
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>
          {value}
          {viewMode === 'self' && privacy && privacy !== 'public' && (
            <PrivacyBadge level={privacy} />
          )}
        </span>
      </div>
    )
  }

  function renderBio() {
    if (p?.bio && isFieldVisible(p.bioPrivacy, viewMode)) {
      return (
        <div className={styles.bioSection}>
          <h3 className={styles.sectionTitle}>О себе</h3>
          <p className={styles.bio}>
            {p.bio}
            {viewMode === 'self' && p.bioPrivacy && p.bioPrivacy !== 'public' && (
              <PrivacyBadge level={p.bioPrivacy} />
            )}
          </p>
        </div>
      )
    }
    if (p?.bio && !isFieldVisible(p.bioPrivacy, viewMode)) {
      return (
        <div className={styles.bioSection}>
          <h3 className={styles.sectionTitle}>О себе</h3>
          <p className={styles.privacyHidden}>
            🔒 {PRIVACY_LABELS[p.bioPrivacy || 'private']}
          </p>
        </div>
      )
    }
    return null
  }

  function editField(label: string, value: string, onChange: (v: string) => void, privacyKey: string, type = 'text') {
    return (
      <label className={styles.editField}>
        <span className={styles.editLabel}>{label}</span>
        <div className={styles.editRow}>
          <input className={styles.input} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} />
          <select className={styles.privacySelect} value={privacies[privacyKey] || 'public'} onChange={(e) => setPrivacies({ ...privacies, [privacyKey]: e.target.value as PrivacyLevel })}>
            {PRIVACY_OPTIONS.map((opt) => <option key={opt} value={opt}>{PRIVACY_LABELS[opt]}</option>)}
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
          <textarea className={styles.textarea} value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} rows={3} />
          <select className={styles.privacySelect} value={privacies[privacyKey] || 'public'} onChange={(e) => setPrivacies({ ...privacies, [privacyKey]: e.target.value as PrivacyLevel })}>
            {PRIVACY_OPTIONS.map((opt) => <option key={opt} value={opt}>{PRIVACY_LABELS[opt]}</option>)}
          </select>
        </div>
      </label>
    )
  }
}

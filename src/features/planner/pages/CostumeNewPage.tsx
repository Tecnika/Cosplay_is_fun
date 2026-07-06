import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getDocs, collection, doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from '@/services/firebase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { createCostume } from '../services/costumeService'
import { addCostumeToProject } from '../services/projectService'
import { PageShell } from '@/components/ui/PageShell'
import type { Costume, UserProfile, WorkshopProject } from '@/types'
import styles from './CostumePage.module.css'

export function CostumeNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId') || undefined

  const [title, setTitle] = useState('')
  const [character, setCharacter] = useState('')
  const [charAttrs, setCharAttrs] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [members, setMembers] = useState<{ uid: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!projectId || !user) return
    const db = getFirebaseDb()
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'workshop_projects', projectId))
        if (!snap.exists()) return
        const p = snap.data() as WorkshopProject
        const memberIds = p.members || []
        const us = await getDocs(collection(db, 'users'))
        const userMap: Record<string, string> = {}
        us.docs.forEach((d) => {
          const data = d.data() as UserProfile
          userMap[d.id] = data.displayName || d.id
        })
        setMembers(memberIds.map((uid) => ({ uid, name: userMap[uid] || uid })))
      } catch {}
    })()
  }, [projectId, user])

  if (!user) return <PageShell requiredAuth isAuthenticated={false} />
  const currentUser = user

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      const costumeData: Omit<Costume, 'id'> = {
        userId: currentUser.uid,
        assignedTo: assignedTo || undefined,
        title: title.trim(),
        character: character.trim(),
        characterAttributes: charAttrs.split(',').map((s) => s.trim()).filter(Boolean),
        projectDate: Date.now(),
        targetDate: targetDate ? new Date(targetDate).getTime() : undefined,
        imageUrl: imageUrl.trim(),
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
        references: [],
        workPlan: [],
        createdAt: Date.now(),
      }
      const costumeId = await createCostume(costumeData)
      if (projectId) {
        await addCostumeToProject(projectId, costumeId)
      }
      navigate(`/planner/costume/${costumeId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания образа')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to="/planner" className={styles.backLink}>← Назад</Link>
        <h1 className={styles.title}>Новый образ</h1>
        {projectId && <p className={styles.hint}>Образ будет добавлен в проект</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Название *</span>
            <input className={styles.input} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название образа" required />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Персонаж</span>
            <input className={styles.input} type="text" value={character} onChange={(e) => setCharacter(e.target.value)} placeholder="Имя персонажа" />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Характеристики (через запятую)</span>
            <input className={styles.input} type="text" value={charAttrs} onChange={(e) => setCharAttrs(e.target.value)} placeholder="Например: рост 170см, голубые глаза" />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Фото (URL)</span>
            <input className={styles.input} type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Теги (через запятую)</span>
            <input className={styles.input} type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="anime, game, jul-2026" />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Целевая дата готовности</span>
            <input className={styles.input} type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </label>
          {members.length > 0 && (
            <label className={styles.field}>
              <span className={styles.label}>Назначить участнику</span>
              <select className={styles.input} value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                <option value="">Себе</option>
                {members.filter((m) => m.uid !== user.uid).map((m) => (
                  <option key={m.uid} value={m.uid}>{m.name}</option>
                ))}
              </select>
            </label>
          )}
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.submit} disabled={saving || !title.trim()}>
            {saving ? 'Создание...' : 'Создать образ'}
          </button>
        </form>
      </div>
    </PageShell>
  )
}

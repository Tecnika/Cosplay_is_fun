import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getDocs, collection, doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from '@/services/firebase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { createProp } from '../services/propService'
import { addPropToProject } from '../services/projectService'
import { PageShell } from '@/components/ui/PageShell'
import type { WorkshopProp, UserProfile, WorkshopProject } from '@/types'
import styles from './CostumePage.module.css'

export function PropNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId') || undefined

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState('')
  const [isConsumable, setIsConsumable] = useState(false)
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
      const propData: Omit<WorkshopProp, 'id'> = {
        userId: currentUser.uid,
        assignedTo: assignedTo || undefined,
        title: title.trim(),
        description: description.trim(),
        quantity: Math.max(1, quantity),
        imageUrl: imageUrl.trim(),
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
        isConsumable,
        references: [],
        workPlan: [],
        createdAt: Date.now(),
      }
      const propId = await createProp(propData)
      if (projectId) {
        await addPropToProject(projectId, propId)
      }
      navigate(`/planner/prop/${propId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания реквизита')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to="/planner" className={styles.backLink}>← Назад</Link>
        <h1 className={styles.title}>Новый реквизит</h1>
        {projectId && <p className={styles.hint}>Реквизит будет добавлен в проект</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Название *</span>
            <input className={styles.input} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название реквизита" required />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Описание</span>
            <textarea className={styles.textarea} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Материал, размер, особенности..." />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Количество</span>
            <input className={styles.input} type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Фото (URL)</span>
            <input className={styles.input} type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Теги (через запятую)</span>
            <input className={styles.input} type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="материал, цвет, размер" />
          </label>
          <label className={styles.field}>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={isConsumable} onChange={(e) => setIsConsumable(e.target.checked)} />
              Расходный материал (ткань, краска и т.п.)
            </label>
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
            {saving ? 'Создание...' : 'Создать реквизит'}
          </button>
        </form>
      </div>
    </PageShell>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useProjects } from '../hooks/useProjects'
import { useCostumes } from '../hooks/useCostumes'
import { useProps } from '../hooks/useProps'
import { ProjectCard } from '../components/ProjectCard'
import { CostumeCard } from '../components/CostumeCard'
import { PropCard } from '../components/PropCard'
import { PageShell } from '@/components/ui/PageShell'
import styles from './WorkshopPage.module.css'

type SortMode = 'date_desc' | 'date_asc' | 'name'
type OwnerFilter = 'all' | 'mine' | 'assigned'

export function WorkshopPage() {
  const { user } = useAuth()
  const userId = user?.uid

  const { projects, loading: pLoading } = useProjects(userId)
  const { costumes, loading: cLoading } = useCostumes(userId)
  const { props, loading: rLoading } = useProps(userId)

  const [tagFilter, setTagFilter] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('date_desc')
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('all')

  const filteredByOwner = costumes.filter((c) => {
    if (ownerFilter === 'mine') return c.userId === user?.uid
    if (ownerFilter === 'assigned') return c.assignedTo === user?.uid && c.userId !== user?.uid
    return true
  })

  const allTags = [...new Set(filteredByOwner.flatMap((c) => c.tags))].sort()

  const filtered = tagFilter
    ? filteredByOwner.filter((c) => c.tags.includes(tagFilter))
    : filteredByOwner

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'date_asc') return (a.createdAt || 0) - (b.createdAt || 0)
    if (sortMode === 'name') return a.title.localeCompare(b.title)
    return (b.createdAt || 0) - (a.createdAt || 0)
  })

  if (!user) return <PageShell requiredAuth isAuthenticated={false} />

  return (
    <PageShell loading={pLoading || cLoading || rLoading}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Моя мастерская</h1>
          <div className={styles.actions}>
            <Link to="/planner/new" className={styles.primaryBtn}>+ Новый проект</Link>
            <Link to="/planner/costume/new" className={styles.secondaryBtn}>+ Новый образ</Link>
            <Link to="/planner/prop/new" className={styles.secondaryBtn}>+ Новый реквизит</Link>
          </div>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Проекты</h2>
          {projects.length === 0 && <p className={styles.empty}>Нет проектов</p>}
          <div className={styles.grid}>
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.ownerTabs}>
              <button className={`${styles.ownerTab} ${ownerFilter === 'all' ? styles.ownerTabActive : ''}`} onClick={() => setOwnerFilter('all')}>Все</button>
              <button className={`${styles.ownerTab} ${ownerFilter === 'mine' ? styles.ownerTabActive : ''}`} onClick={() => setOwnerFilter('mine')}>Мои</button>
              <button className={`${styles.ownerTab} ${ownerFilter === 'assigned' ? styles.ownerTabActive : ''}`} onClick={() => setOwnerFilter('assigned')}>Назначенные</button>
            </div>
            <select className={styles.sortSelect} value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
              <option value="date_desc">Сначала новые</option>
              <option value="date_asc">Сначала старые</option>
              <option value="name">По названию</option>
            </select>
          </div>

          {allTags.length > 0 && (
            <div className={styles.tagBar}>
              <button
                className={`${styles.tagBtn} ${!tagFilter ? styles.tagActive : ''}`}
                onClick={() => setTagFilter('')}
              >
                Все
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  className={`${styles.tagBtn} ${tagFilter === t ? styles.tagActive : ''}`}
                  onClick={() => setTagFilter(tagFilter === t ? '' : t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {sorted.length === 0 && <p className={styles.empty}>Нет образов</p>}
          <div className={styles.grid}>
            {sorted.map((c) => <CostumeCard key={c.id} costume={c} />)}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Реквизит ({props.length})</h2>
          {props.length === 0 && <p className={styles.empty}>Нет реквизита</p>}
          <div className={styles.grid}>
            {props.map((p) => <PropCard key={p.id} prop={p} />)}
          </div>
        </section>
      </div>
    </PageShell>
  )
}

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getDocs, collection } from 'firebase/firestore'
import { getFirebaseDb } from '@/services/firebase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useProject } from '../hooks/useProject'
import { useCostumes } from '../hooks/useCostumes'
import { useProps } from '../hooks/useProps'
import { getCostume } from '../services/costumeService'
import { getProp } from '../services/propService'
import { getProjectCostumeIds, getProjectPropIds, addMember, removeMember, updateProject, deleteProject, transferOwnership, removeCostumeFromProject, removePropFromProject, addCostumeToProject, addPropToProject } from '../services/projectService'
import { getProjectShopItems, createShopItem, updateShopItem, deleteShopItem } from '../services/shoppingItemService'
import { createNotification } from '@/features/notifications/services/notificationService'
import { CostumeCard } from '../components/CostumeCard'
import { PropCard } from '../components/PropCard'
import { MemberSearch } from '../components/MemberSearch'
import { PageShell } from '@/components/ui/PageShell'
import type { Costume, WorkshopProp, ShoppingItem, ShoppingItemStatus, UserProfile } from '@/types'
import styles from './ProjectPage.module.css'

const OBJECT_COLORS = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075']

function objectColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i)
  return OBJECT_COLORS[Math.abs(hash) % OBJECT_COLORS.length]
}

export function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { project, loading, refresh } = useProject(id)

  const [costumes, setCostumes] = useState<Costume[]>([])
  const [props, setProps] = useState<WorkshopProp[]>([])
  const [shopItems, setShopItems] = useState<ShoppingItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [userMap, setUserMap] = useState<Record<string, string>>({})
  const [addError, setAddError] = useState('')
  const [transferTo, setTransferTo] = useState('')
  const [newShopItem, setNewShopItem] = useState({ item: '', forWhat: '', price: '', quantity: 1 })
  const [showAvailable, setShowAvailable] = useState(false)
  const { costumes: allCostumes, refresh: refreshAllCostumes } = useCostumes(user?.uid)
  const { props: allProps, refresh: refreshAllProps } = useProps(user?.uid)

  const costumeIdsForFilter = useMemo(() => costumes.map((c) => c.id), [costumes])
  const propIdsForFilter = useMemo(() => props.map((p) => p.id), [props])

  const availableCostumes = useMemo(() => allCostumes.filter((c) => !costumeIdsForFilter.includes(c.id)), [allCostumes, costumeIdsForFilter])
  const availableProps = useMemo(() => allProps.filter((p) => !propIdsForFilter.includes(p.id)), [allProps, propIdsForFilter])

  const [dragOverSection, setDragOverSection] = useState<'costumes' | 'props' | null>(null)
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({})
  const [sortField, setSortField] = useState<string>('')
  const [sortAsc, setSortAsc] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === sortedShopItems.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(sortedShopItems.map((e) => e.item.id)))
  }

  async function handleBatchStatus(status: ShoppingItemStatus) {
    try {
      await Promise.all([...selectedIds].map((id) => updateShopItem(id, { status })))
      setShopItems((prev) => prev.map((it) => selectedIds.has(it.id) ? { ...it, status } : it))
    } catch {} finally { setSelectedIds(new Set()) }
  }

  async function handleBatchDelete() {
    if (!confirm(`Удалить ${selectedIds.size} покупок?`)) return
    try {
      await Promise.all([...selectedIds].map((id) => deleteShopItem(id)))
      setShopItems((prev) => prev.filter((it) => !selectedIds.has(it.id)))
    } catch {} finally { setSelectedIds(new Set()) }
  }

  async function handleBatchMoveToProject() {
    if (!id) return
    try {
      await Promise.all([...selectedIds].map((itemId) => updateShopItem(itemId, { sourceType: 'project', sourceId: id, linkedTo: [id] })))
      await fullRefresh()
    } catch {} finally { setSelectedIds(new Set()) }
  }

  function toggleSort(field: string) {
    if (sortField === field) setSortAsc((prev) => !prev)
    else { setSortField(field); setSortAsc(true) }
  }

  useEffect(() => {
    const db = getFirebaseDb()
    getDocs(collection(db, 'users')).then((snap) => {
      const map: Record<string, string> = {}
      snap.docs.forEach((d) => {
        const data = d.data() as UserProfile
        map[d.id] = data.displayName || d.id
      })
      setUserMap(map)
    }).catch(() => {})
  }, [])

  const isOwner = user && project?.ownerId === user.uid

  const loadProjectItems = useCallback(async () => {
    if (!id) return
    setItemsLoading(true)
    try {
      const [costumeIds, propIds] = await Promise.all([
        getProjectCostumeIds(id),
        getProjectPropIds(id),
      ])
      const [clist, plist] = await Promise.all([
        Promise.all(costumeIds.map((cid) => getCostume(cid))),
        Promise.all(propIds.map((pid) => getProp(pid))),
      ])
      setCostumes(clist.filter(Boolean) as Costume[])
      setProps(plist.filter(Boolean) as WorkshopProp[])
      const items = await getProjectShopItems(id)
      setShopItems(items)
    } catch {} finally {
      setItemsLoading(false)
    }
  }, [id])

  const fullRefresh = useCallback(async () => {
    await Promise.all([refresh(), loadProjectItems(), refreshAllCostumes(), refreshAllProps()])
  }, [refresh, loadProjectItems, refreshAllCostumes, refreshAllProps])

  useEffect(() => { loadProjectItems() }, [loadProjectItems])

  const mergedShopItems = useMemo((): { item: ShoppingItem; sourceType: string; sourceId: string; sourceTitle: string }[] => {
    return shopItems.map((it) => {
      let sourceTitle = 'Проект'
      if (it.sourceType === 'costume') {
        const c = costumes.find((x) => x.id === it.sourceId)
        if (c) sourceTitle = c.title
      } else if (it.sourceType === 'prop') {
        const p = props.find((x) => x.id === it.sourceId)
        if (p) sourceTitle = p.title
      }
      return { item: it, sourceType: it.sourceType, sourceId: it.sourceId, sourceTitle }
    })
  }, [shopItems, costumes, props])

  const sortedShopItems = useMemo(() => {
    const items = [...mergedShopItems]
    if (!sortField) return items
    items.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'item': cmp = a.item.item.localeCompare(b.item.item); break
        case 'forWhat': cmp = a.item.forWhat.localeCompare(b.item.forWhat); break
        case 'quantity': cmp = (a.item.quantity || 0) - (b.item.quantity || 0); break
        case 'price': cmp = (a.item.price || 0) - (b.item.price || 0); break
        case 'status': cmp = (a.item.status || 'to_buy').localeCompare(b.item.status || 'to_buy'); break
        case 'source': cmp = a.sourceTitle.localeCompare(b.sourceTitle); break
      }
      return sortAsc ? cmp : -cmp
    })
    return items
  }, [mergedShopItems, sortField, sortAsc])

  async function handleStatusChange(itemId: string, status: ShoppingItemStatus) {
    const entry = shopItems.find((e) => e.id === itemId)
    if (!entry) return
    try {
      await updateShopItem(itemId, { status, statusNote: status === 'wasted' ? entry.statusNote || '' : '' })
      setShopItems((prev) => prev.map((it) => it.id === itemId ? { ...it, status, statusNote: status === 'wasted' ? it.statusNote || '' : '' } : it))
    } catch {}
  }

  async function handleStatusNoteSave(itemId: string) {
    const statusNote = noteEdits[itemId]
    if (statusNote === undefined) return
    try {
      await updateShopItem(itemId, { statusNote })
      setNoteEdits((prev) => { const n = { ...prev }; delete n[itemId]; return n })
      setShopItems((prev) => prev.map((it) => it.id === itemId ? { ...it, statusNote } : it))
    } catch {}
  }

  async function handleDeleteShopItem(itemId: string) {
    if (!confirm('Удалить покупку?')) return
    try {
      await deleteShopItem(itemId)
      setShopItems((prev) => prev.filter((it) => it.id !== itemId))
    } catch {}
  }

  async function handleSourceChange(itemId: string, targetType: 'costume' | 'prop' | 'project', targetId: string) {
    const entry = shopItems.find((e) => e.id === itemId)
    if (!entry || (entry.sourceType === targetType && entry.sourceId === targetId)) return
    try {
      await updateShopItem(itemId, { sourceType: targetType, sourceId: targetId })
      await fullRefresh()
    } catch {}
  }

  if (!user) return <PageShell requiredAuth isAuthenticated={false} />
  if (loading) return <PageShell loading />
  if (!project) return <PageShell><div className={styles.page}>Проект не найден</div></PageShell>

  async function handleAddMember(uid: string) {
    if (!id || !project) return
    setAddError('')
    try {
      await addMember(id, uid)
      await createNotification({
        userId: uid,
        type: 'member_added',
        projectId: id,
        projectTitle: project.title,
        message: `Вас добавили в проект «${project.title}»`,
        read: false,
        createdAt: Date.now(),
      })
      await fullRefresh()
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Ошибка добавления участника')
    }
  }

  async function handleRemoveMember(uid: string) {
    if (!id) return
    try {
      await removeMember(id, uid)
      await fullRefresh()
    } catch {}
  }

  async function addShopItem(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !newShopItem.item.trim() || !user) return
    try {
      await createShopItem({
        item: newShopItem.item.trim(),
        forWhat: newShopItem.forWhat.trim(),
        price: newShopItem.price ? Number(newShopItem.price) : undefined,
        quantity: newShopItem.quantity,
        userId: user.uid,
        sourceType: 'project',
        sourceId: id,
        linkedTo: [id],
        status: 'to_buy',
        statusNote: '',
        createdAt: Date.now(),
      })
      await fullRefresh()
    } catch {}
    setNewShopItem({ item: '', forWhat: '', price: '', quantity: 1 })
  }

  async function handleToggleComplete() {
    if (!id || !isOwner) return
    try {
      if (project?.completedAt) {
        await updateProject(id, { completedAt: 0 })
      } else {
        await updateProject(id, { completedAt: Date.now() })
      }
      await fullRefresh()
    } catch {}
  }

  async function handleTogglePublic() {
    if (!id) return
    try {
      if (!project) return
    await updateProject(id, { isPublic: !project.isPublic })
      await fullRefresh()
    } catch {}
  }

  async function handleDelete() {
    if (!id || !isOwner) return
    if (!confirm('Удалить проект? Образы останутся в мастерской.')) return
    try {
      await deleteProject(id, user!.uid)
      navigate('/planner')
    } catch {}
  }

  async function handleRemoveCostume(costumeId: string) {
    if (!id) return
    if (!confirm('Убрать образ из проекта? Он останется в коллекции.')) return
    try {
      await removeCostumeFromProject(id, costumeId)
      setCostumes((prev) => prev.filter((c) => c.id !== costumeId))
      await fullRefresh()
    } catch {}
  }

  async function handleRemoveProp(propId: string) {
    if (!id) return
    if (!confirm('Убрать реквизит из проекта? Он останется в коллекции.')) return
    try {
      await removePropFromProject(id, propId)
      setProps((prev) => prev.filter((p) => p.id !== propId))
      await fullRefresh()
    } catch {}
  }

  function handleExport() {
    if (!project) return
    const lines: string[] = [
      `Проект: ${project.title}`,
      `Описание: ${project.description || '—'}`,
      `Тип: ${project.type === 'group' ? 'Групповой' : 'Личный'}`,
      `Статус: ${project.deadline ? 'Дедлайн: ' + new Date(project.deadline).toLocaleDateString('ru-RU') : '—'}`,
      '',
      '--- Образы ---',
    ]
    costumes.forEach((c) => {
      const cItems = shopItems.filter((it) => it.sourceType === 'costume' && it.sourceId === c.id)
      lines.push('')
      lines.push(`  ${c.title}`)
      lines.push(`  Персонаж: ${c.character || '—'}`)
      if ((c.characterAttributes || []).length) lines.push(`  Характеристики: ${c.characterAttributes.join(', ')}`)
      if ((c.tags || []).length) lines.push(`  Теги: ${c.tags.join(', ')}`)
      if (c.targetDate) lines.push(`  Цель: ${new Date(c.targetDate).toLocaleDateString('ru-RU')}`)
      if ((c.references || []).length) lines.push(`  Референсов: ${c.references.length}`)
      if (cItems.length) {
        lines.push(`  Список покупок:`)
        cItems.forEach((it) => {
          lines.push(`    - ${it.item} (${it.forWhat}) x${it.quantity}${it.price ? ' = ' + it.price * it.quantity + '₽' : ''}`)
        })
      }
      if ((c.workPlan || []).length) {
        lines.push(`  План работ:`)
        function printTasks(tasks: typeof c.workPlan, indent: number) {
          tasks.forEach((t) => {
            lines.push(`${' '.repeat(indent)}- ${t.title} [${t.status === 'completed' ? '✓' : t.status === 'in_progress' ? '…' : '○'}]${t.milestone ? ' 🎯' : ''}${t.deadline ? ' до ' + new Date(t.deadline).toLocaleDateString('ru-RU') : ''}`)
            if ((t.children || []).length) printTasks(t.children || [], indent + 2)
          })
        }
        printTasks(c.workPlan || [], 4)
      }
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.title}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleTransfer() {
    if (!id || !transferTo || !isOwner) return
    const name = userMap[transferTo] || transferTo
    if (!confirm(`Передать владение проектом пользователю «${name}»?`)) return
    try {
      await transferOwnership(id, transferTo)
      await fullRefresh()
      setTransferTo('')
    } catch {}
  }

  async function handleAddToProject(type: 'costume' | 'prop', itemId: string) {
    if (!id) return
    try {
      if (type === 'costume') {
        await addCostumeToProject(id, itemId)
      } else {
        await addPropToProject(id, itemId)
      }
      await fullRefresh()
    } catch {}
  }

  async function handleDragAdd(ev: React.DragEvent, targetType: 'costume' | 'prop') {
    ev.preventDefault()
    setDragOverSection(null)
    const data = ev.dataTransfer.getData('text/plain')
    if (!data || !id) return
    const { type, itemId } = JSON.parse(data) as { type: string; itemId: string }
    if (type !== targetType) return
    await handleAddToProject(type as 'costume' | 'prop', itemId)
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to="/planner" className={styles.backLink}>← Назад</Link>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{project.title}</h1>
            {project.description && <p className={styles.desc}>{project.description}</p>}
            {project.deadline && <p className={styles.desc}>Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}</p>}
            {project.completedAt && <p className={styles.desc}>Завершён: {new Date(project.completedAt).toLocaleDateString('ru-RU')}</p>}
            <div className={styles.meta}>
              <span className={styles.badge}>
                {project.type === 'group' ? 'Групповой' : 'Личный'}
              </span>
              <span className={isOwner ? styles.badgeOwner : styles.badgeMember}>
                {isOwner ? 'Владелец' : 'Участник'}
              </span>
              <button onClick={handleTogglePublic} className={styles.textBtn}>
                {project.isPublic ? 'Публичный' : 'Приватный'}
              </button>
              {isOwner && (
                <button onClick={handleToggleComplete} className={styles.textBtn}>
                  {project.completedAt ? '✓ Завершён' : 'Завершить проект'}
                </button>
              )}
            </div>
          </div>
          <div className={styles.headerActions}>
            {isOwner && (
              <Link to={`/planner/project/${id}/edit`} className={styles.secondaryBtn}>Редактировать</Link>
            )}
            <Link to={`/planner/costume/new?projectId=${id}`} className={styles.primaryBtn}>+ Образ</Link>
            <Link to={`/planner/prop/new?projectId=${id}`} className={styles.secondaryBtn}>+ Реквизит</Link>
            <button onClick={handleExport} className={styles.secondaryBtn}>Экспорт</button>
            {isOwner && (
              <button onClick={handleDelete} className={styles.dangerBtn}>Удалить</button>
            )}
            {isOwner && project.type === 'group' && (
              <div className={styles.transferWrap}>
                <select
                  className={styles.transferSelect}
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                >
                  <option value="">-- Передать проект --</option>
                  {project.members.filter((uid) => uid !== user!.uid).map((uid) => (
                    <option key={uid} value={uid}>{userMap[uid] || uid}</option>
                  ))}
                </select>
                {transferTo && (
                  <button onClick={handleTransfer} className={styles.transferBtn}>Передать</button>
                )}
              </div>
            )}
          </div>
        </div>

        {project.type === 'group' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Участники ({project.members.length})</h2>
            <div className={styles.members}>
              {project.members.map((uid) => (
                <div key={uid} className={styles.member}>
                  <span>{userMap[uid] || uid}</span>
                  {isOwner && uid !== user!.uid && (
                    <button onClick={() => handleRemoveMember(uid)} className={styles.removeMemberBtn}>✕</button>
                  )}
                </div>
              ))}
              {isOwner && (
                <MemberSearch
                  exclude={project.members}
                  onSelect={(uid) => handleAddMember(uid)}
                />
              )}
              {addError && <div className={styles.error}>{addError}</div>}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Образы ({costumes.length})</h2>
          {itemsLoading && <p>Загрузка...</p>}
          {!itemsLoading && costumes.length === 0 && <p className={styles.empty}>Нет образов</p>}
          <div
            className={`${styles.dropZone} ${dragOverSection === 'costumes' ? styles.dropActive : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverSection('costumes') }}
            onDragLeave={() => setDragOverSection(null)}
            onDrop={(e) => handleDragAdd(e, 'costume')}
          >
            <div className={styles.grid}>
              {costumes.map((c) => (
                <div key={c.id} className={styles.costumeWithActions}>
                  <CostumeCard costume={c} />
                  {isOwner && (
                    <button onClick={() => handleRemoveCostume(c.id)} className={styles.removeCostumeBtn} title="Убрать из проекта">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Реквизит ({props.length})</h2>
          {itemsLoading && <p>Загрузка...</p>}
          {!itemsLoading && props.length === 0 && <p className={styles.empty}>Нет реквизита</p>}
          <div
            className={`${styles.dropZone} ${dragOverSection === 'props' ? styles.dropActive : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverSection('props') }}
            onDragLeave={() => setDragOverSection(null)}
            onDrop={(e) => handleDragAdd(e, 'prop')}
          >
            <div className={styles.grid}>
              {props.map((p) => (
                <div key={p.id} className={styles.costumeWithActions}>
                  <PropCard prop={p} />
                  {isOwner && (
                    <button onClick={() => handleRemoveProp(p.id)} className={styles.removeCostumeBtn} title="Убрать из проекта">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <button className={styles.availableToggle} onClick={() => setShowAvailable(!showAvailable)}>
            {showAvailable ? '▼' : '▶'} Добавить из мастерской ({availableCostumes.length + availableProps.length})
          </button>
          {showAvailable && (
            <div className={styles.availablePanel}>
              {availableCostumes.length > 0 && (
                <>
                  <h3 className={styles.availableTitle}>Образы</h3>
                  <div className={styles.grid}>
                    {availableCostumes.map((c) => (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'costume', itemId: c.id }))}
                        onClick={() => handleAddToProject('costume', c.id)}
                        className={styles.draggableCard}
                      >
                        <CostumeCard costume={c} />
                      </div>
                    ))}
                  </div>
                </>
              )}
              {availableProps.length > 0 && (
                <>
                  <h3 className={styles.availableTitle}>Реквизит</h3>
                  <div className={styles.grid}>
                    {availableProps.map((p) => (
                      <div
                        key={p.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'prop', itemId: p.id }))}
                        onClick={() => handleAddToProject('prop', p.id)}
                        className={styles.draggableCard}
                      >
                        <PropCard prop={p} />
                      </div>
                    ))}
                  </div>
                </>
              )}
              {availableCostumes.length === 0 && availableProps.length === 0 && (
                <p className={styles.empty}>Все образы и реквизит уже в проекте</p>
              )}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Список покупок проекта ({mergedShopItems.length})</h2>

          <form className={styles.shopForm} onSubmit={addShopItem}>
            <input className={styles.shopInput} type="text" placeholder="Что купить" value={newShopItem.item} onChange={(e) => setNewShopItem({ ...newShopItem, item: e.target.value })} required />
            <input className={styles.shopInput} type="text" placeholder="Для чего" value={newShopItem.forWhat} onChange={(e) => setNewShopItem({ ...newShopItem, forWhat: e.target.value })} />
            <input className={styles.shopInput} type="number" min={1} placeholder="Кол-во" value={newShopItem.quantity} onChange={(e) => setNewShopItem({ ...newShopItem, quantity: Number(e.target.value) })} />
            <input className={styles.shopInput} type="text" placeholder="Цена" value={newShopItem.price} onChange={(e) => setNewShopItem({ ...newShopItem, price: e.target.value })} />
            <button type="submit" className={styles.shopAddBtn}>+</button>
          </form>

          {mergedShopItems.length === 0 && <p className={styles.empty}>Нет покупок</p>}
          {mergedShopItems.length > 0 && (
            <div className={styles.projectShopTable}>
              <div className={styles.projectShopHeader}>
                <span><input type="checkbox" className={styles.shopCheckbox} checked={selectedIds.size > 0 && selectedIds.size === sortedShopItems.length} onChange={toggleSelectAll} /></span>
                <span className={styles.sortable} onClick={() => toggleSort('item')}>Что{sortField === 'item' ? (sortAsc ? ' ▲' : ' ▼') : ''}</span>
                <span className={styles.sortable} onClick={() => toggleSort('forWhat')}>Для чего{sortField === 'forWhat' ? (sortAsc ? ' ▲' : ' ▼') : ''}</span>
                <span className={styles.sortable} onClick={() => toggleSort('quantity')}>Кол-во{sortField === 'quantity' ? (sortAsc ? ' ▲' : ' ▼') : ''}</span>
                <span className={styles.sortable} onClick={() => toggleSort('price')}>Цена{sortField === 'price' ? (sortAsc ? ' ▲' : ' ▼') : ''}</span>
                <span>Ссылка</span>
                <span className={styles.sortable} onClick={() => toggleSort('status')}>Статус{sortField === 'status' ? (sortAsc ? ' ▲' : ' ▼') : ''}</span>
                <span className={styles.sortable} onClick={() => toggleSort('source')}>Источник{sortField === 'source' ? (sortAsc ? ' ▲' : ' ▼') : ''}</span>
                <span>Действия</span>
              </div>
              {selectedIds.size > 0 && (
                <div className={styles.batchBar}>
                  <span className={styles.batchCount}>Выбрано: {selectedIds.size}</span>
                  <select className={styles.batchSelect} onChange={(e) => { const v = e.target.value; if (v) handleBatchStatus(v as ShoppingItemStatus) }} defaultValue="">
                    <option value="" disabled>Статус</option>
                    <option value="to_buy">К покупке</option>
                    <option value="ordered">Заказано</option>
                    <option value="bought">Куплено</option>
                    <option value="wasted">Потрачено</option>
                  </select>
                  <button className={styles.batchBtn} onClick={() => handleBatchDelete()}>Удалить</button>
                  <button className={styles.batchBtn} onClick={() => handleBatchMoveToProject()}>В проект</button>
                </div>
              )}
              {sortedShopItems.map((entry) => {
                const selected = selectedIds.has(entry.item.id)
                return (
                <div key={entry.item.id} className={`${styles.projectShopRow} ${selected ? styles.selectedRow : ''}`} style={{ borderLeft: `4px solid ${objectColor(entry.sourceId || 'project')}` }}>
                  <span><input type="checkbox" className={styles.shopCheckbox} checked={selected} onChange={() => toggleSelect(entry.item.id)} /></span>
                  <span className={styles.cellItem}>{entry.item.item}</span>
                  <span className={styles.cellFor}>{entry.item.forWhat}</span>
                  <span className={styles.cellNum}>{entry.item.quantity}</span>
                  <span className={styles.cellPrice}>{entry.item.price ? `${entry.item.price} ₽` : '-'}</span>
                  <span className={styles.cellLink}>{entry.item.link ? <a href={entry.item.link} target="_blank" rel="noreferrer" className={styles.shopLinkCell}>↗</a> : '-'}</span>
                  <span className={styles.shopStatusCell}>
                    <select className={`${styles.shopStatusSelect} ${styles['status_' + (entry.item.status || 'to_buy')]}`} value={entry.item.status || 'to_buy'} onChange={(e) => handleStatusChange(entry.item.id, e.target.value as ShoppingItemStatus)}>
                      <option value="to_buy">○ К покупке</option>
                      <option value="ordered">◐ Заказано</option>
                      <option value="bought">● Куплено</option>
                      <option value="wasted">✕ Потрачено</option>
                    </select>
                    {entry.item.status === 'wasted' && (
                      <input className={styles.shopStatusNote} type="text" placeholder="причина..." value={(noteEdits[entry.item.id] ?? entry.item.statusNote) || ''} onChange={(e) => setNoteEdits((prev) => ({ ...prev, [entry.item.id]: e.target.value }))} onBlur={() => handleStatusNoteSave(entry.item.id)} onKeyDown={(e) => e.key === 'Enter' && handleStatusNoteSave(entry.item.id)} />
                    )}
                  </span>
                  <span className={styles.shopSourceCell}>
                    <span className={styles.shopSourceLink}>
                      {entry.sourceType !== 'project' ? (
                        <Link to={`/planner/${entry.sourceType}/${entry.sourceId}`}>{entry.sourceTitle}</Link>
                      ) : entry.sourceTitle}
                    </span>
                    <select className={styles.shopSourceSelect} value={`${entry.sourceType}:${entry.sourceId}`} onChange={(e) => {
                      const [t, ...rest] = e.target.value.split(':')
                      const tId = rest.join(':')
                      handleSourceChange(entry.item.id, t as 'costume' | 'prop' | 'project', tId)
                    }}>
                      <optgroup label="Образы">
                        {costumes.map((c) => <option key={c.id} value={`costume:${c.id}`}>{c.title}</option>)}
                      </optgroup>
                      <optgroup label="Реквизит">
                        {props.map((p) => <option key={p.id} value={`prop:${p.id}`}>{p.title}</option>)}
                      </optgroup>
                      <option value="project:">Проект</option>
                    </select>
                  </span>
                  <span>
                    <button className={styles.shopDeleteBtn} onClick={() => handleDeleteShopItem(entry.item.id)} title="Удалить">×</button>
                  </span>
                </div>
              )})}
              <div className={styles.projectShopTotal}>
                Итого: {mergedShopItems.reduce((s, e) => s + (e.item.price || 0) * e.item.quantity, 0)} ₽
              </div>
            </div>
          )}
        </section>

      </div>
    </PageShell>
  )
}

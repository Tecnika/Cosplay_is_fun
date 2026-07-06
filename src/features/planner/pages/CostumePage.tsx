import { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCostume } from '../hooks/useCostume'
import { updateCostume, deleteCostume } from '../services/costumeService'
import { getSourceShopItems, replaceSourceShopItems, updateShopItem, deleteShopItem } from '../services/shoppingItemService'
import { ReferenceList } from '../components/ReferenceList'
import { ShoppingList } from '../components/ShoppingList'
import { WorkPlanTree } from '../components/WorkPlanTree'
import { PageShell } from '@/components/ui/PageShell'
import type { Reference, ShoppingItem, ShoppingItemStatus, TaskNode } from '@/types'
import styles from './CostumePage.module.css'

export function CostumePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { costume, loading, refresh } = useCostume(id)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [character, setCharacter] = useState('')
  const [charAttrs, setCharAttrs] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [references, setReferences] = useState<Reference[]>([])
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [shopItems, setShopItems] = useState<ShoppingItem[]>([])
  const [workPlan, setWorkPlan] = useState<TaskNode[]>([])
  const [assignedTo, setAssignedTo] = useState('')
  const [shopEditMode, setShopEditMode] = useState(false)
  const [editShopItems, setEditShopItems] = useState<ShoppingItem[]>([])
  const [shopSaving, setShopSaving] = useState(false)
  const [shopSelected, setShopSelected] = useState<Set<string>>(new Set())
  const [shopSort, setShopSort] = useState<[string, boolean]>(['', true])

  const sortedShopItems = useMemo(() => {
    const items = [...shopItems]
    const [field, asc] = shopSort
    if (!field) return items
    items.sort((a, b) => {
      let cmp = 0
      switch (field) {
        case 'item': cmp = a.item.localeCompare(b.item); break
        case 'forWhat': cmp = a.forWhat.localeCompare(b.forWhat); break
        case 'quantity': cmp = (a.quantity || 0) - (b.quantity || 0); break
        case 'price': cmp = (a.price || 0) - (b.price || 0); break
        case 'status': cmp = (a.status || 'to_buy').localeCompare(b.status || 'to_buy'); break
      }
      return asc ? cmp : -cmp
    })
    return items
  }, [shopItems, shopSort])

  async function handleShopSave() {
    if (!id || !user) return
    setShopSaving(true)
    try {
      await replaceSourceShopItems('costume', id, user.uid, editShopItems.map(({ item, forWhat, link, price, quantity }) => ({ item, forWhat, link, price, quantity })))
      const items = await getSourceShopItems('costume', id)
      setShopItems(items)
      setShopEditMode(false)
      setEditShopItems([])
    } catch {} finally { setShopSaving(false) }
  }

  useEffect(() => {
    if (costume) {
      setTitle(costume.title)
      setCharacter(costume.character || '')
      setCharAttrs(costume.characterAttributes.join(', '))
      setImageUrl(costume.imageUrl || '')
      setTags(costume.tags.join(', '))
      setTargetDate(costume.targetDate ? new Date(costume.targetDate).toISOString().split('T')[0] : '')
      setReferences(costume.references || [])
      setWorkPlan(costume.workPlan || [])
      setAssignedTo(costume.assignedTo || '')
    }
  }, [costume])

  useEffect(() => {
    if (!id) return
    getSourceShopItems('costume', id).then(setShopItems).catch(() => {})
  }, [id])

  if (!user) return <PageShell requiredAuth isAuthenticated={false} />
  if (loading) return <PageShell loading />
  if (!costume) return <PageShell><div className={styles.page}>Образ не найден</div></PageShell>

  const canEdit = costume.userId === user.uid || costume.assignedTo === user.uid

  async function startEditing() {
    try {
      const items = await getSourceShopItems('costume', id!)
      setShoppingList(items.map(({ item, forWhat, link, price, quantity }) => ({ id: crypto.randomUUID(), item, forWhat, link, price: price || 0, quantity, userId: '', sourceType: 'costume', sourceId: '', linkedTo: [], createdAt: Date.now() })))
      setEditing(true)
    } catch {}
  }

  async function handleSave() {
    if (!id || !user) return
    setSaving(true)
    setError('')
    try {
      await updateCostume(id, {
        title: title.trim(),
        character: character.trim(),
        characterAttributes: charAttrs.split(',').map((s) => s.trim()).filter(Boolean),
        imageUrl: imageUrl.trim(),
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
        targetDate: targetDate ? new Date(targetDate).getTime() : undefined,
        assignedTo: assignedTo || undefined,
        references,
        workPlan,
      })
      await replaceSourceShopItems('costume', id, user.uid, shoppingList.map(({ item, forWhat, link, price, quantity }) => ({ item, forWhat, link, price, quantity })))
      await refresh()
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    if (!confirm('Удалить образ?')) return
    try {
      await deleteCostume(id)
      navigate('/planner')
    } catch {}
  }

  function cancelEdit() {
    setEditing(false)
    if (costume) {
      setTitle(costume.title)
      setCharacter(costume.character || '')
      setCharAttrs(costume.characterAttributes.join(', '))
      setImageUrl(costume.imageUrl || '')
      setTags(costume.tags.join(', '))
      setTargetDate(costume.targetDate ? new Date(costume.targetDate).toISOString().split('T')[0] : '')
      setReferences(costume.references || [])
      setWorkPlan(costume.workPlan || [])
      setShoppingList([])
    }
  }

  if (editing && canEdit) {
    return (
      <PageShell>
        <div className={styles.page}>
          <h1 className={styles.title}>Редактирование образа</h1>
          <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSave() }}>
            <label className={styles.field}>
              <span className={styles.label}>Название *</span>
              <input className={styles.input} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Персонаж</span>
              <input className={styles.input} type="text" value={character} onChange={(e) => setCharacter(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Характеристики (через запятую)</span>
              <input className={styles.input} type="text" value={charAttrs} onChange={(e) => setCharAttrs(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Фото (URL)</span>
              <input className={styles.input} type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Теги (через запятую)</span>
              <input className={styles.input} type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Целевая дата</span>
              <input className={styles.input} type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </label>

            <ReferenceList items={references} onChange={setReferences} />
            <ShoppingList items={shoppingList} onChange={setShoppingList} />
            <WorkPlanTree tasks={workPlan} references={references} shoppingItems={shoppingList} onChange={setWorkPlan} />

            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.actions}>
              <button type="submit" className={styles.submit} disabled={saving || !title.trim()}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button type="button" onClick={cancelEdit} className={styles.cancelBtn}>Отмена</button>
            </div>
          </form>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to="/planner" className={styles.backLink}>← Назад</Link>
        <div className={styles.viewHeader}>
          <div>
            <h1 className={styles.title}>{costume.title}</h1>
            {costume.character && <p className={styles.character}>Персонаж: {costume.character}</p>}
            {costume.characterAttributes.length > 0 && (
              <div className={styles.attrs}>
                {costume.characterAttributes.map((a) => <span key={a} className={styles.attr}>{a}</span>)}
              </div>
            )}
            {costume.targetDate && (
              <p className={styles.date}>Цель: {new Date(costume.targetDate).toLocaleDateString('ru-RU')}</p>
            )}
            {costume.assignedTo && costume.assignedTo !== costume.userId && (
              <p className={styles.date}>Назначен: {costume.assignedTo}</p>
            )}
          </div>
          {canEdit && (
            <div className={styles.viewActions}>
              <button onClick={startEditing} className={styles.editBtn}>Редактировать</button>
              <button onClick={handleDelete} className={styles.dangerBtn}>Удалить</button>
            </div>
          )}
        </div>

        {costume.imageUrl && (
          <div className={styles.mainImage}>
            <img src={costume.imageUrl} alt={costume.title} />
          </div>
        )}

        {(costume.tags || []).length > 0 && (
          <div className={styles.tags}>
            {(costume.tags || []).map((t) => <span key={t} className={styles.tag}>{t}</span>)}
          </div>
        )}

        {(costume.references || []).length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Референсы</h2>
            <div className={styles.refGrid}>
              {(costume.references || []).map((ref) => (
                <div key={ref.id} className={styles.refCard}>
                  <img src={ref.url} alt={ref.label} className={styles.refImg} />
                  <span className={styles.refLabel}>{ref.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Список покупок ({shopItems.length})</h2>

          {shopEditMode ? (
            <div className={styles.shopEditBlock}>
              <ShoppingList items={editShopItems} onChange={setEditShopItems} />
              <div className={styles.shopEditActions}>
                <button onClick={handleShopSave} className={styles.submit} disabled={shopSaving}>{shopSaving ? 'Сохранение...' : 'Сохранить'}</button>
                <button onClick={() => { setShopEditMode(false); setEditShopItems([]) }} className={styles.cancelBtn}>Отмена</button>
              </div>
            </div>
          ) : (
            <>
              {canEdit && (
                <button onClick={async () => {
                  try {
                    const items = await getSourceShopItems('costume', id!)
                    setEditShopItems(items.map(({ item, forWhat, link, price, quantity }) => ({ id: crypto.randomUUID(), item, forWhat, link, price: price || 0, quantity, userId: '', sourceType: 'costume', sourceId: '', linkedTo: [], createdAt: Date.now() })))
                    setShopEditMode(true)
                  } catch {}
                }} className={styles.textBtn} style={{ marginBottom: 'var(--spacing-sm)' }}>Редактировать список</button>
              )}
              {shopItems.length === 0 && <p className={styles.empty}>Нет покупок</p>}
              {shopItems.length > 0 && (
                <div className={styles.shopTable}>
                  <div className={styles.shopHeader}>
                    <span><input type="checkbox" className={styles.shopCheckbox} checked={shopSelected.size > 0 && shopSelected.size === sortedShopItems.length} onChange={() => { if (shopSelected.size === sortedShopItems.length) setShopSelected(new Set()); else setShopSelected(new Set(sortedShopItems.map((e) => e.id))) }} /></span>
                    <span className={styles.sortable} onClick={() => setShopSort(([f, d]) => f === 'item' ? ['item', !d] : ['item', true])}>Что{shopSort[0] === 'item' ? (shopSort[1] ? ' ▲' : ' ▼') : ''}</span>
                    <span className={styles.sortable} onClick={() => setShopSort(([f, d]) => f === 'forWhat' ? ['forWhat', !d] : ['forWhat', true])}>Для чего{shopSort[0] === 'forWhat' ? (shopSort[1] ? ' ▲' : ' ▼') : ''}</span>
                    <span className={styles.sortable} onClick={() => setShopSort(([f, d]) => f === 'quantity' ? ['quantity', !d] : ['quantity', true])}>Кол-во{shopSort[0] === 'quantity' ? (shopSort[1] ? ' ▲' : ' ▼') : ''}</span>
                    <span className={styles.sortable} onClick={() => setShopSort(([f, d]) => f === 'price' ? ['price', !d] : ['price', true])}>Цена{shopSort[0] === 'price' ? (shopSort[1] ? ' ▲' : ' ▼') : ''}</span>
                    <span>Ссылка</span>
                    <span className={styles.sortable} onClick={() => setShopSort(([f, d]) => f === 'status' ? ['status', !d] : ['status', true])}>Статус{shopSort[0] === 'status' ? (shopSort[1] ? ' ▲' : ' ▼') : ''}</span>
                    <span>Действия</span>
                  </div>
                  {shopSelected.size > 0 && (
                    <div className={styles.batchBar}>
                      <span className={styles.batchCount}>{shopSelected.size}</span>
                      <select className={styles.batchSelect} onChange={async (e) => { const v = e.target.value; if (v) { try { await Promise.all([...shopSelected].map((sid) => updateShopItem(sid, { status: v as ShoppingItemStatus }))); setShopItems((prev) => prev.map((it) => shopSelected.has(it.id) ? { ...it, status: v as ShoppingItemStatus } : it)); } catch {} finally { setShopSelected(new Set()) } } }} defaultValue="">
                        <option value="" disabled>Статус</option>
                        <option value="to_buy">К покупке</option>
                        <option value="ordered">Заказано</option>
                        <option value="bought">Куплено</option>
                        <option value="wasted">Потрачено</option>
                      </select>
                      <button className={styles.batchBtn} onClick={async () => { if (!confirm(`Удалить ${shopSelected.size} покупок?`)) return; try { await Promise.all([...shopSelected].map((sid) => deleteShopItem(sid))); setShopItems((prev) => prev.filter((it) => !shopSelected.has(it.id))); } catch {} finally { setShopSelected(new Set()) } }}>Удалить</button>
                    </div>
                  )}
                  {sortedShopItems.map((it) => {
                    const selected = shopSelected.has(it.id)
                    return (
                    <div key={it.id} className={`${styles.shopRow} ${selected ? styles.selectedRow : ''}`}>
                      <span><input type="checkbox" className={styles.shopCheckbox} checked={selected} onChange={() => setShopSelected((prev) => { const next = new Set(prev); if (next.has(it.id)) next.delete(it.id); else next.add(it.id); return next })} /></span>
                      <span className={styles.cellItem}>{it.item}</span>
                      <span className={styles.cellFor}>{it.forWhat}</span>
                      <span className={styles.cellNum}>{it.quantity}</span>
                      <span className={styles.cellPrice}>{it.price ? `${it.price} ₽` : '-'}</span>
                      <span className={styles.cellLink}>{it.link ? <a href={it.link} target="_blank" rel="noreferrer" className={styles.shopLinkCell}>↗</a> : '-'}</span>
                      <span className={styles.shopStatusCell}>
                        <select className={`${styles.shopStatusSelect} ${styles['status_' + (it.status || 'to_buy')]}`} value={it.status || 'to_buy'} onChange={async (e) => { const s = e.target.value as ShoppingItemStatus; try { await updateShopItem(it.id, { status: s }); setShopItems((prev) => prev.map((x) => x.id === it.id ? { ...x, status: s } : x)) } catch {} }}>
                          <option value="to_buy">○ К покупке</option>
                          <option value="ordered">◐ Заказано</option>
                          <option value="bought">● Куплено</option>
                          <option value="wasted">✕ Потрачено</option>
                        </select>
                      </span>
                      <span><button className={styles.shopDeleteBtn} onClick={async () => { if (!confirm('Удалить?')) return; try { await deleteShopItem(it.id); setShopItems((prev) => prev.filter((x) => x.id !== it.id)) } catch {} }} title="Удалить">×</button></span>
                    </div>
                  )})}
                  <div className={styles.shopTotal}>
                    Итого: {shopItems.reduce((s, it) => s + (it.price || 0) * it.quantity, 0)} ₽
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {(costume.workPlan || []).length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>План работ</h2>
            <RenderTree nodes={costume.workPlan || []} />
          </section>
        )}
      </div>
    </PageShell>
  )
}

function RenderTree({ nodes, depth = 0 }: { nodes: TaskNode[]; depth?: number }) {
  return (
    <div className={styles.tree} style={{ marginLeft: depth * 24 }}>
      {nodes.map((node) => (
        <div key={node.id} className={`${styles.treeNode} ${node.milestone ? styles.milestone : ''}`}>
          <div className={styles.treeNodeHeader}>
            <span className={`${styles.treeStatus} ${styles[node.status]}`} />
            <strong>{node.title}</strong>
            {node.milestone && <span className={styles.milestoneBadge}>Цель</span>}
            {node.deadline && <span className={styles.treeDeadline}>до {new Date(node.deadline).toLocaleDateString('ru-RU')}</span>}
          </div>
          {node.description && <p className={styles.treeDesc}>{node.description}</p>}
          {node.referenceIds.length > 0 && (
            <div className={styles.treeMeta}>Референсы: {node.referenceIds.length}</div>
          )}
          {node.shoppingItemIds.length > 0 && (
            <div className={styles.treeMeta}>Покупки: {node.shoppingItemIds.length}</div>
          )}
          {(node.children || []).length > 0 && <RenderTree nodes={node.children || []} depth={depth + 1} />}
        </div>
      ))}
    </div>
  )
}

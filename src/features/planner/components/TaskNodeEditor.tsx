import type { TaskNode, Reference, ShoppingItem } from '@/types'
import styles from './WorkPlanTree.module.css'

interface TaskNodeEditorProps {
  node: TaskNode
  index: number
  parents: number[]
  references: Reference[]
  shoppingItems: ShoppingItem[]
  onUpdate: (path: number[], updated: TaskNode) => void
  onDelete: (path: number[]) => void
}

export function TaskNodeEditor({ node, index, parents, references, shoppingItems, onUpdate, onDelete }: TaskNodeEditorProps) {
  const path = [...parents, index]

  function update(field: keyof TaskNode, value: unknown) {
    onUpdate(path, { ...node, [field]: value })
  }

  function handleChildUpdate(childPath: number[], updated: TaskNode) {
    const children = node.children.map((c, i) => i === childPath[childPath.length - 1] ? updated : c)
    onUpdate(path, { ...node, children })
  }

  function handleChildDelete(childPath: number[]) {
    const children = node.children.filter((_, i) => i !== childPath[childPath.length - 1])
    onUpdate(path, { ...node, children })
  }

  function handleChildAdd() {
    const child: TaskNode = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      status: 'pending',
      milestone: false,
      referenceIds: [],
      shoppingItemIds: [],
      children: [],
    }
    onUpdate(path, { ...node, children: [...node.children, child] })
  }

  function toggleRef(refId: string) {
    const ids = node.referenceIds.includes(refId)
      ? node.referenceIds.filter((id) => id !== refId)
      : [...node.referenceIds, refId]
    update('referenceIds', ids)
  }

  function toggleShop(itemId: string) {
    const ids = node.shoppingItemIds.includes(itemId)
      ? node.shoppingItemIds.filter((id) => id !== itemId)
      : [...node.shoppingItemIds, itemId]
    update('shoppingItemIds', ids)
  }

  return (
    <div className={styles.node}>
      <div className={styles.nodeHeader}>
        <input
          className={styles.nodeTitle}
          type="text"
          value={node.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Название задачи"
        />
        <select
          className={styles.statusSelect}
          value={node.status}
          onChange={(e) => update('status', e.target.value)}
        >
          <option value="pending">В планах</option>
          <option value="in_progress">В работе</option>
          <option value="completed">Готово</option>
        </select>
        <label className={styles.milestoneLabel}>
          <input
            type="checkbox"
            checked={node.milestone}
            onChange={(e) => update('milestone', e.target.checked)}
          />
          Цель
        </label>
        <input
          className={styles.dateInput}
          type="date"
          value={node.deadline ? new Date(node.deadline).toISOString().split('T')[0] : ''}
          onChange={(e) => update('deadline', e.target.value ? new Date(e.target.value).getTime() : undefined)}
        />
        <button type="button" onClick={() => onDelete(path)} className={styles.removeBtn}>✕</button>
      </div>
      <textarea
        className={styles.nodeDesc}
        value={node.description || ''}
        onChange={(e) => update('description', e.target.value)}
        placeholder="Описание задачи"
        rows={2}
      />
      {(references.length > 0 || shoppingItems.length > 0) && (
        <div className={styles.attachments}>
          {references.length > 0 && (
            <div className={styles.attachGroup}>
              <span className={styles.attachLabel}>Референсы:</span>
              {references.map((ref) => (
                <label key={ref.id} className={styles.attachItem}>
                  <input
                    type="checkbox"
                    checked={node.referenceIds.includes(ref.id)}
                    onChange={() => toggleRef(ref.id)}
                  />
                  {ref.label || 'Без названия'}
                </label>
              ))}
            </div>
          )}
          {shoppingItems.length > 0 && (
            <div className={styles.attachGroup}>
              <span className={styles.attachLabel}>Покупки:</span>
              {shoppingItems.map((it) => (
                <label key={it.id} className={styles.attachItem}>
                  <input
                    type="checkbox"
                    checked={node.shoppingItemIds.includes(it.id)}
                    onChange={() => toggleShop(it.id)}
                  />
                  {it.item || 'Без названия'}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
      <button type="button" onClick={handleChildAdd} className={styles.addChildBtn}>+ Подзадача</button>
      {node.children.length > 0 && (
        <div className={styles.children}>
          {node.children.map((child, i) => (
            <TaskNodeEditor
              key={child.id}
              node={child}
              index={i}
              parents={path}
              references={references}
              shoppingItems={shoppingItems}
              onUpdate={handleChildUpdate}
              onDelete={handleChildDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

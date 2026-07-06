import type { Reference } from '@/types'
import styles from './ReferenceList.module.css'

interface ReferenceListProps {
  items: Reference[]
  onChange: (items: Reference[]) => void
}

function emptyRef(): Reference {
  return { id: crypto.randomUUID(), label: '', url: '' }
}

export function ReferenceList({ items, onChange }: ReferenceListProps) {
  function update(index: number, field: keyof Reference, value: string) {
    const next = items.map((r, i) => i === index ? { ...r, [field]: value } : r)
    onChange(next)
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  function add() {
    onChange([...items, emptyRef()])
  }

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <h3 className={styles.title}>Референсы</h3>
        <button type="button" onClick={add} className={styles.addBtn}>+ Добавить</button>
      </div>
      {items.length === 0 && <p className={styles.empty}>Нет референсов</p>}
      {items.map((ref, i) => (
        <div key={ref.id} className={styles.row}>
          <input
            className={styles.input}
            type="text"
            value={ref.label}
            onChange={(e) => update(i, 'label', e.target.value)}
            placeholder="Что (общий вид, парик...)"
          />
          <input
            className={styles.input}
            type="text"
            value={ref.url}
            onChange={(e) => update(i, 'url', e.target.value)}
            placeholder="URL фото"
          />
          {ref.url && (
            <a href={ref.url} target="_blank" rel="noreferrer" className={styles.preview}>
              <img src={ref.url} alt="" className={styles.thumb} />
            </a>
          )}
          <button type="button" onClick={() => remove(i)} className={styles.removeBtn}>✕</button>
        </div>
      ))}
    </div>
  )
}

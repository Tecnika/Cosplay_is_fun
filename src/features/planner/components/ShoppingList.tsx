import type { ShoppingItem } from '@/types'
import styles from './ShoppingList.module.css'

interface ShoppingListProps {
  items: ShoppingItem[]
  onChange: (items: ShoppingItem[]) => void
}

function emptyItem(): ShoppingItem {
  return { id: crypto.randomUUID(), item: '', forWhat: '', link: '', price: 0, quantity: 1, userId: '', sourceType: 'costume', sourceId: '', linkedTo: [], createdAt: Date.now() }
}

export function ShoppingList({ items, onChange }: ShoppingListProps) {
  function update(index: number, field: keyof ShoppingItem, value: string | number) {
    const next = items.map((r, i) => i === index ? { ...r, [field]: value } : r)
    onChange(next)
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  function add() {
    onChange([...items, emptyItem()])
  }

  const total = items.reduce((s, it) => s + (it.price || 0) * it.quantity, 0)

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <h3 className={styles.title}>Список покупок</h3>
        <button type="button" onClick={add} className={styles.addBtn}>+ Добавить</button>
      </div>
      {items.length === 0 && <p className={styles.empty}>Нет покупок</p>}
      {items.map((it, i) => (
        <div key={it.id} className={styles.row}>
          <input
            className={styles.input}
            type="text"
            value={it.item}
            onChange={(e) => update(i, 'item', e.target.value)}
            placeholder="Что"
          />
          <input
            className={styles.input}
            type="text"
            value={it.forWhat}
            onChange={(e) => update(i, 'forWhat', e.target.value)}
            placeholder="Для чего"
          />
          <input
            className={styles.inputSmall}
            type="number"
            value={it.quantity}
            onChange={(e) => update(i, 'quantity', Number(e.target.value))}
            min={1}
          />
          <input
            className={styles.inputSmall}
            type="number"
            value={it.price || ''}
            onChange={(e) => update(i, 'price', e.target.value ? Number(e.target.value) : 0)}
            placeholder="Цена"
          />
          <input
            className={styles.input}
            type="text"
            value={it.link || ''}
            onChange={(e) => update(i, 'link', e.target.value)}
            placeholder="Ссылка"
          />
          <button type="button" onClick={() => remove(i)} className={styles.removeBtn}>✕</button>
        </div>
      ))}
      {items.length > 0 && (
        <div className={styles.total}>Итого: {total} ₽</div>
      )}
    </div>
  )
}

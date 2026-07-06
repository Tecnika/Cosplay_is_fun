import { Link } from 'react-router-dom'
import type { WorkshopProp } from '@/types'
import styles from './PropCard.module.css'

interface PropCardProps {
  prop: WorkshopProp
}

export function PropCard({ prop }: PropCardProps) {
  return (
    <Link to={`/planner/prop/${prop.id}`} className={styles.card}>
      {prop.imageUrl && (
        <div className={styles.imageWrap}>
          <img src={prop.imageUrl} alt={prop.title} className={styles.image} />
        </div>
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>{prop.title}</h3>
        <p className={styles.meta}>×{prop.quantity} {prop.isConsumable ? '(расходник)' : ''}</p>
        {prop.tags.length > 0 && (
          <div className={styles.tags}>
            {prop.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
          </div>
        )}
      </div>
    </Link>
  )
}

import { Link } from 'react-router-dom'
import type { Costume } from '@/types'
import styles from './CostumeCard.module.css'

interface CostumeCardProps {
  costume: Costume
}

export function CostumeCard({ costume }: CostumeCardProps) {
  return (
    <Link to={`/planner/costume/${costume.id}`} className={styles.card}>
      {costume.imageUrl && (
        <div className={styles.imageWrap}>
          <img src={costume.imageUrl} alt={costume.title} className={styles.image} />
        </div>
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>{costume.title}</h3>
        <p className={styles.character}>{costume.character}</p>
        {costume.tags.length > 0 && (
          <div className={styles.tags}>
            {costume.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
          </div>
        )}
      </div>
    </Link>
  )
}

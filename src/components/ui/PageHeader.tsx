import { Link } from 'react-router-dom'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  action?: { label: string; to: string }
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className={styles.row}>
      <h2 className={styles.title}>{title}</h2>
      {action && (
        <Link to={action.to} className={styles.btn}>{action.label}</Link>
      )}
    </div>
  )
}

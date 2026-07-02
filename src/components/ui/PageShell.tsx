import type { ReactNode } from 'react'
import styles from './PageShell.module.css'

interface PageShellProps {
  children: ReactNode
  loading?: boolean
  loadingMessage?: string
  requiredAuth?: boolean
  isAuthenticated?: boolean
}

export function PageShell({ children, loading, loadingMessage = 'Загрузка...', requiredAuth, isAuthenticated }: PageShellProps) {
  if (loading) return <div className={styles.page}>{loadingMessage}</div>
  if (requiredAuth && !isAuthenticated) return <div className={styles.page}>Авторизуйтесь</div>
  return <div className={styles.page}>{children}</div>
}

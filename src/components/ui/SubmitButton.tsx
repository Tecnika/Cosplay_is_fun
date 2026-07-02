import type { ReactNode } from 'react'
import styles from './SubmitButton.module.css'

interface SubmitButtonProps {
  loading: boolean
  loadingText?: string
  children: ReactNode
}

export function SubmitButton({ loading, loadingText = 'Сохранение...', children }: SubmitButtonProps) {
  return (
    <button className={styles.btn} disabled={loading}>
      {loading ? loadingText : children}
    </button>
  )
}

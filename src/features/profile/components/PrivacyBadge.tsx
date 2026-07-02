import type { PrivacyLevel } from '@/types'
import { PRIVACY_LABELS, PRIVACY_ICONS } from '../types'
import styles from './PrivacyBadge.module.css'

interface PrivacyBadgeProps {
  level: PrivacyLevel
}

export function PrivacyBadge({ level }: PrivacyBadgeProps) {
  if (level === 'public') return null

  return (
    <span className={styles.badge} title={PRIVACY_LABELS[level]}>
      {PRIVACY_ICONS[level]}
    </span>
  )
}

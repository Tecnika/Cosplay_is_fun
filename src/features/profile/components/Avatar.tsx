import { useMemo } from 'react'
import styles from './Avatar.module.css'

interface AvatarProps {
  /** Имя пользователя (для генерации инициалов) */
  name: string
  /** URL аватара (если есть) */
  url?: string
  /** Размер в пикселях */
  size?: number
  /** CSS-класс */
  className?: string
}

/** Цвета для фона аватара (на основе хеша имени) */
const AVATAR_COLORS = [
  '#6c5ce7', '#a29bfe', '#fd79a8', '#e84393',
  '#00b894', '#00cec9', '#0984e3', '#74b9ff',
  '#fdcb6e', '#e17055', '#636e72', '#2d3436',
]

/** Получает инициалы из имени (макс 2 символа) */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

/** Выбирает цвет на основе хеша строки */
function getColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function Avatar({ name, url, size = 48, className }: AvatarProps) {
  const initials = useMemo(() => getInitials(name), [name])
  const bgColor = useMemo(() => getColor(name), [name])

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${styles.avatar} ${className || ''}`}
        style={{ width: size, height: size, minWidth: size }}
      />
    )
  }

  return (
    <div
      className={`${styles.avatar} ${styles.placeholder} ${className || ''}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        backgroundColor: bgColor,
        fontSize: size * 0.4,
      }}
      title={name}
    >
      {initials}
    </div>
  )
}

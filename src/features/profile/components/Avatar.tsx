import BoringAvatar from 'boring-avatars'
import type { AvatarVariant } from '@/types'
import styles from './Avatar.module.css'

interface AvatarProps {
  /** Имя пользователя (для генерации аватара) */
  name: string
  /** URL аватара (если есть) */
  url?: string
  /** Размер в пикселях */
  size?: number
  /** CSS-класс */
  className?: string
  /** Вариант boring-avatar (по умолчанию из настроек пользователя) */
  variant?: AvatarVariant
}

const AVATAR_KEY = 'cosplay-avatar'

/** Палитра для светлой темы */
const LIGHT_PALETTE = ['#6c5ce7', '#a29bfe', '#fd79a8', '#00b894', '#fdcb6e']

/** Палитра для тёмной темы */
const DARK_PALETTE = ['#a29bfe', '#6c5ce7', '#e84393', '#55efc4', '#ffeaa7']

/** Возвращает палитру в зависимости от текущей темы интерфейса */
function getThemePalette(): string[] {
  if (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark') {
    return DARK_PALETTE
  }
  return LIGHT_PALETTE
}

/** Читает предпочтения аватара из localStorage */
function getAvatarVariant(): AvatarVariant {
  try {
    return (localStorage.getItem(AVATAR_KEY) as AvatarVariant) || 'beam'
  } catch {
    return 'beam'
  }
}

export function Avatar({ name, url, size = 48, className, variant: propVariant }: AvatarProps) {
  const variant = propVariant || getAvatarVariant()
  const palette = getThemePalette()

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
      className={`${styles.avatar} ${className || ''}`}
      style={{ width: size, height: size, minWidth: size }}
      title={name}
    >
      <BoringAvatar
        name={name}
        size={size}
        variant={variant}
        colors={palette}
      />
    </div>
  )
}

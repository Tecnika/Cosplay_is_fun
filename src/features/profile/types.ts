import type { PrivacyLevel } from '@/types'

/** Отображаемое название уровня приватности */
export const PRIVACY_LABELS: Record<PrivacyLevel, string> = {
  public: 'Для всех',
  friends: 'Для друзей',
  circle: 'Для круга',
  private: 'Никому',
}

/** Иконки для уровней приватности */
export const PRIVACY_ICONS: Record<PrivacyLevel, string> = {
  public: '🌍',
  friends: '👥',
  circle: '🔵',
  private: '🔒',
}

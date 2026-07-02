/** Базовые типы данных приложения */

/**
 * Профиль пользователя.
 * Хранится в коллекции Firestore `users`.
 */
/** Уровень приватности поля */
export type PrivacyLevel = 'public' | 'friends' | 'circle' | 'private'

/** Поле с уровнем приватности */
export interface PrivacyField<T> {
  value: T
  privacy: PrivacyLevel
}

export interface UserProfile {
  id: string
  email?: string
  displayName: string
  role: Role
  photoURL?: string

  // Личные данные
  firstName?: string
  lastName?: string
  birthDate?: string
  bio?: string

  // Приватность полей
  firstNamePrivacy?: PrivacyLevel
  lastNamePrivacy?: PrivacyLevel
  birthDatePrivacy?: PrivacyLevel
  bioPrivacy?: PrivacyLevel
  photoPrivacy?: PrivacyLevel

  createdAt: number
  updatedAt?: number
}

/** Значения по умолчанию для приватности полей */
export const DEFAULT_PRIVACY: PrivacyLevel = 'public'

/**
 * Косплей-проект (планировщик).
 */
export interface CosplayProject {
  id: string
  userId: string
  title: string
  character: string
  series: string
  status: 'planning' | 'in_progress' | 'completed' | 'paused'
  deadline?: number
  budget?: number
  spent?: number
  checklist: ChecklistItem[]
  notes?: string
  photos: string[]        // URLs
  createdAt: number
  updatedAt?: number
}

/**
 * Элемент чеклиста для косплей-проекта.
 */
export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

/**
 * Пост в социальной ленте.
 */
export interface SocialPost {
  id: string
  userId: string
  authorName: string
  authorPhoto?: string
  text: string
  images: string[]
  likes: number
  likedBy: string[]        // userIds
  commentsCount: number
  createdAt: number
  updatedAt?: number
}

/**
 * Комментарий к посту.
 */
export interface Comment {
  id: string
  postId: string
  userId: string
  authorName: string
  authorPhoto?: string
  text: string
  createdAt: number
}

/**
 * Роль пользователя в системе.
 * superadmin — полный доступ, назначает админов
 * admin — управление контентом и пользователями
 * moderator — модерация постов и комментариев
 * user — базовый функционал (по умолчанию)
 */
export type Role = 'superadmin' | 'admin' | 'moderator' | 'user'

/**
 * Тема оформления сайта.
 */
export type Theme = 'light' | 'dark'

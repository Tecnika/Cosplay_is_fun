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
 * Тема оформления сайта (светлая/тёмная).
 */
export type Theme = 'light' | 'dark'

/** Цветовая схема */
export type ColorTheme = 'cosplay' | 'ocean' | 'sunset' | 'forest'

/** Стилевой вариант */
export type StyleVariant = 'rounded' | 'sharp' | 'glass' | 'bold'

/** Уведомление */
export interface AppNotification {
  id: string
  userId: string
  type: 'member_added' | 'project_updated'
  projectId: string
  projectTitle: string
  message: string
  read: boolean
  createdAt: number
}

/** Настройки дизайна */
export interface DesignSettings {
  colorTheme: ColorTheme
  styleVariant: StyleVariant
}

// ====== Мастерская косплеера ======

/** Референс — фото с подписью (часть образа) */
export interface Reference {
  id: string
  label: string
  url: string
}

/** Элемент списка покупок */
export interface ShoppingItem {
  id: string
  item: string
  forWhat: string
  link?: string
  price?: number
  quantity: number
  userId: string
  sourceType: 'costume' | 'prop' | 'project'
  sourceId: string
  linkedTo: string[]
  status?: ShoppingItemStatus
  statusNote?: string
  createdAt: number
}

/** Статус задачи в плане работ */
export type TaskStatus = 'pending' | 'in_progress' | 'completed'

/** Статус покупки */
export type ShoppingItemStatus = 'to_buy' | 'ordered' | 'bought' | 'wasted'

/** Узел дерева работ (рекурсивный) */
export interface TaskNode {
  id: string
  title: string
  description?: string
  status: TaskStatus
  deadline?: number
  milestone: boolean
  referenceIds: string[]
  shoppingItemIds: string[]
  children: TaskNode[]
}

/** Образ — центральная сущность мастерской */
export interface Costume {
  id: string
  userId: string
  assignedTo?: string
  title: string
  character: string
  characterAttributes: string[]
  projectDate: number
  targetDate?: number
  imageUrl: string
  tags: string[]
  references: Reference[]
  workPlan: TaskNode[]
  createdAt: number
  updatedAt?: number
}

/** Тип проекта: личный или групповой */
export type ProjectType = 'personal' | 'group'

/** Проект — группировка образов и реквизита с участниками */
export interface WorkshopProject {
  id: string
  title: string
  description?: string
  type: ProjectType
  isPublic: boolean
  ownerId: string
  members: string[]
  deadline?: number
  completedAt?: number
  createdAt: number
  updatedAt?: number
}

/** Реквизит — элемент костюма или декорации */
export interface WorkshopProp {
  id: string
  userId: string
  assignedTo?: string
  title: string
  description: string
  quantity: number
  imageUrl: string
  tags: string[]
  isConsumable: boolean
  references: Reference[]
  workPlan: TaskNode[]
  createdAt: number
  updatedAt?: number
}

/** Статус дружбы между двумя пользователями */
export type FriendshipStatus = 'none' | 'pending' | 'accepted'

/** Роль в круге */
export type CircleRole = 'creator' | 'moderator' | 'subscriber'

/** Дружба (Firestore документ) */
export interface Friendship {
  id: string
  user1: string
  user2: string
  /** Кто отправил заявку */
  actionUser: string
  status: FriendshipStatus
  createdAt: number
}

/** Круг (Firestore документ) */
export interface Circle {
  id: string
  name: string
  description: string
  avatarURL?: string
  coverURL?: string
  contacts?: string
  createdBy: string
  memberCount: number
  createdAt: number
}

/** Участник круга (подколлекция) */
export interface CircleMember {
  uid: string
  role: CircleRole
  displayName: string
  photoURL?: string
  joinedAt: number
}

/** Статус дружбы со стороны текущего пользователя */
export type FriendRelation =
  | 'none'          // ничего
  | 'subscribed'    // ты подписался, он ещё нет
  | 'subscriber'    // он подписался, ты ещё нет
  | 'friend'        // взаимная дружба

/** Статус дружбы между двумя пользователями */
export type FriendshipStatus = 'none' | 'pending' | 'accepted'

/** Роль в круге */
export type CircleRole = 'creator' | 'moderator' | 'subscriber'

/** Дружба (Firestore документ) */
export interface Friendship {
  id: string
  user1: string
  user2: string
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
  isPrivate: boolean
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

/** Приглашение в круг (подколлекция) */
export interface CircleInvite {
  id: string
  code: string
  createdBy: string
  createdAt: number
  uses: number
  maxUses?: number
}

/** Статус дружбы со стороны текущего пользователя */
export type FriendRelation =
  | 'none'
  | 'subscribed'
  | 'subscriber'
  | 'friend'

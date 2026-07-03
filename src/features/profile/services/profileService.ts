import { doc, getDoc, updateDoc, serverTimestamp, query, where, limit, getDocs, collection } from 'firebase/firestore'
import { getFirebaseDb } from '@/services/firebase'
import type { UserProfile, PrivacyLevel } from '@/types'

/** Загружает профиль по ID */
export async function getProfileById(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb()
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as UserProfile
}

/** Ищет профиль по имени пользователя (displayName) */
export async function getProfileByUsername(username: string): Promise<UserProfile | null> {
  const db = getFirebaseDb()
  const q = query(collection(db, 'users'), where('displayName', '==', username))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as UserProfile
}

/** Ищет пользователей по префиксу displayName (case-insensitive) */
export async function searchUsers(q: string, max = 20): Promise<UserProfile[]> {
  const db = getFirebaseDb()
  if (q.length < 1) return []
  const lower = q.toLowerCase()
  const snap = await getDocs(query(
    collection(db, 'users'),
    where('displayName', '>=', lower),
    where('displayName', '<', lower + '~'),
    limit(max * 3),
  ))
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserProfile)
  return all.filter((u) => u.displayName.toLowerCase().includes(lower)).slice(0, max)
}

/** Обновляет профиль */
export async function updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const db = getFirebaseDb()
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/** Проверяет, видно ли поле с данным уровнем приватности */
export function isFieldVisible(
  privacy: PrivacyLevel | undefined,
  viewerRole: 'self' | 'superadmin' | 'other',
  isFriend?: boolean,
  hasCommonCircle?: boolean,
): boolean {
  if (viewerRole === 'self') return true
  if (viewerRole === 'superadmin') return true

  if (privacy === 'public' || !privacy) return true
  if (privacy === 'friends' && isFriend) return true
  if (privacy === 'circle' && hasCommonCircle) return true

  return false
}

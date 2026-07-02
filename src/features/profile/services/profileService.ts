import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseDb } from '@/services/firebase'
import type { UserProfile } from '@/types'

/** Загружает профиль по ID */
export async function getProfileById(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb()
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as UserProfile
}

/** Обновляет профиль */
export async function updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const db = getFirebaseDb()
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

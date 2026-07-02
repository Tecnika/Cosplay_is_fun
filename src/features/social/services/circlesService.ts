import { doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp, collection } from 'firebase/firestore'
import { getFirebaseDb } from '@/services/firebase'
import { getProfileById } from '@/features/profile/services/profileService'
import type { Circle, CircleMember, CircleRole } from '../types'

/** Создать круг */
export async function createCircle(name: string, description: string, createdBy: string): Promise<string> {
  const db = getFirebaseDb()
  const profile = await getProfileById(createdBy)
  const displayName = profile?.displayName || 'Пользователь'

  const circleRef = await addDoc(collection(db, 'circles'), {
    name,
    description,
    createdBy,
    memberCount: 1,
    memberIds: [createdBy],
    createdAt: serverTimestamp(),
  })

  await setDoc(doc(db, 'circles', circleRef.id, 'members', createdBy), {
    uid: createdBy,
    role: 'creator',
    displayName,
    photoURL: profile?.photoURL || '',
    joinedAt: serverTimestamp(),
  })

  return circleRef.id
}

/** Получить круг по ID */
export async function getCircle(circleId: string): Promise<Circle | null> {
  const db = getFirebaseDb()
  const snap = await getDoc(doc(db, 'circles', circleId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Circle
}

/** Получить все круги пользователя */
export async function getUserCircles(uid: string): Promise<Circle[]> {
  const db = getFirebaseDb()
  const snap = await getDocs(query(collection(db, 'circles'), where('memberIds', 'array-contains', uid)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Circle)
}

/** Получить участников круга */
export async function getCircleMembers(circleId: string): Promise<CircleMember[]> {
  const db = getFirebaseDb()
  const snap = await getDocs(collection(db, 'circles', circleId, 'members'))
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as CircleMember)
}

/** Вступить в круг */
export async function joinCircle(circleId: string, uid: string, displayName: string): Promise<void> {
  const db = getFirebaseDb()
  const profile = await getProfileById(uid)
  await setDoc(doc(db, 'circles', circleId, 'members', uid), {
    uid,
    role: 'subscriber',
    displayName,
    photoURL: profile?.photoURL || '',
    joinedAt: serverTimestamp(),
  })
  const ref = doc(db, 'circles', circleId)
  const circle = await getDoc(ref)
  if (circle.exists()) {
    await updateDoc(ref, {
      memberCount: (circle.data().memberCount || 0) + 1,
      memberIds: [...(circle.data().memberIds || []), uid],
    })
  }
}

/** Покинуть круг */
export async function leaveCircle(circleId: string, uid: string): Promise<void> {
  const db = getFirebaseDb()
  await deleteDoc(doc(db, 'circles', circleId, 'members', uid))
  const ref = doc(db, 'circles', circleId)
  const circle = await getDoc(ref)
  if (circle.exists()) {
    const members = (circle.data().memberIds || []) as string[]
    await updateDoc(ref, {
      memberCount: Math.max(0, (circle.data().memberCount || 1) - 1),
      memberIds: members.filter((id: string) => id !== uid),
    })
  }
}

/** Удалить круг (только creator) */
export async function deleteCircle(circleId: string, uid: string): Promise<void> {
  const db = getFirebaseDb()
  const circle = await getDoc(doc(db, 'circles', circleId))
  if (!circle.exists()) throw new Error('Круг не найден')
  if (circle.data().createdBy !== uid) throw new Error('Только создатель может удалить круг')

  // Удаляем всех участников
  const members = await getDocs(collection(db, 'circles', circleId, 'members'))
  await Promise.all(members.docs.map((d) => deleteDoc(d.ref)))
  // Удаляем сам круг
  await deleteDoc(doc(db, 'circles', circleId))
}

/** Назначить модератора (только creator) */
export async function setModerator(circleId: string, uid: string): Promise<void> {
  const db = getFirebaseDb()
  await updateDoc(doc(db, 'circles', circleId, 'members', uid), { role: 'moderator' })
}

/** Обновить круг (название, описание, контакты, аватар, обложка) */
export async function updateCircle(circleId: string, uid: string, data: Partial<Circle>): Promise<void> {
  const db = getFirebaseDb()
  const circle = await getDoc(doc(db, 'circles', circleId))
  if (!circle.exists()) throw new Error('Круг не найден')
  if (circle.data().createdBy !== uid) throw new Error('Только создатель может редактировать круг')

  // Разрешённые поля для обновления
  const allowed: (keyof Circle)[] = ['name', 'description', 'contacts', 'avatarURL', 'coverURL']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in data) update[key] = data[key]
  }
  if (Object.keys(update).length === 0) return

  await updateDoc(doc(db, 'circles', circleId), update)
}

/** Проверить роль участника в круге */
export async function getMemberRole(circleId: string, uid: string): Promise<CircleRole | null> {
  const db = getFirebaseDb()
  const snap = await getDoc(doc(db, 'circles', circleId, 'members', uid))
  if (!snap.exists()) return null
  return snap.data().role as CircleRole
}

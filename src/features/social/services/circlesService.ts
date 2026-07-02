import { doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp, collection } from 'firebase/firestore'
import { getFirebaseDb } from '@/services/firebase'
import { getProfileById } from '@/features/profile/services/profileService'
import type { Circle, CircleMember, CircleRole, CircleInvite } from '../types'

function genCode(): string {
  return Math.random().toString(36).slice(2, 10)
}

/** Создать круг */
export async function createCircle(
  name: string, description: string, createdBy: string, isPrivate = false,
): Promise<string> {
  const db = getFirebaseDb()
  const profile = await getProfileById(createdBy)
  const displayName = profile?.displayName || 'Пользователь'

  const circleRef = await addDoc(collection(db, 'circles'), {
    name,
    description,
    createdBy,
    isPrivate,
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

/** Все круги пользователя */
export async function getUserCircles(uid: string): Promise<Circle[]> {
  const db = getFirebaseDb()
  const snap = await getDocs(query(collection(db, 'circles'), where('memberIds', 'array-contains', uid)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Circle)
}

/** Публичные круги (для страницы «Все круги») */
export async function getPublicCircles(): Promise<Circle[]> {
  const db = getFirebaseDb()
  const snap = await getDocs(query(collection(db, 'circles'), where('isPrivate', '==', false)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Circle)
}

/** ID всех кругов пользователя */
export async function getUserCircleIds(uid: string): Promise<string[]> {
  const circles = await getUserCircles(uid)
  return circles.map((c) => c.id)
}

/** Есть ли у двух пользователей хотя бы один общий круг */
export async function haveCommonCircle(uid1: string, uid2: string): Promise<boolean> {
  const [ids1, ids2] = await Promise.all([getUserCircleIds(uid1), getUserCircleIds(uid2)])
  return ids1.some((id) => ids2.includes(id))
}

/** Участники круга */
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

  const members = await getDocs(collection(db, 'circles', circleId, 'members'))
  await Promise.all(members.docs.map((d) => deleteDoc(d.ref)))
  await deleteDoc(doc(db, 'circles', circleId))
}

/** Назначить модератора */
export async function setModerator(circleId: string, uid: string): Promise<void> {
  const db = getFirebaseDb()
  await updateDoc(doc(db, 'circles', circleId, 'members', uid), { role: 'moderator' })
}

/** Обновить круг */
export async function updateCircle(circleId: string, uid: string, data: Partial<Circle>): Promise<void> {
  const db = getFirebaseDb()
  const circle = await getDoc(doc(db, 'circles', circleId))
  if (!circle.exists()) throw new Error('Круг не найден')
  if (circle.data().createdBy !== uid) throw new Error('Только создатель может редактировать круг')

  const allowed: (keyof Circle)[] = ['name', 'description', 'contacts', 'avatarURL', 'coverURL', 'isPrivate']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in data) update[key] = data[key]
  }
  if (Object.keys(update).length === 0) return

  await updateDoc(doc(db, 'circles', circleId), update)
}

/** Проверить роль участника */
export async function getMemberRole(circleId: string, uid: string): Promise<CircleRole | null> {
  const db = getFirebaseDb()
  const snap = await getDoc(doc(db, 'circles', circleId, 'members', uid))
  if (!snap.exists()) return null
  return snap.data().role as CircleRole
}

/** Сгенерировать код приглашения */
export async function createInvite(circleId: string, uid: string): Promise<string> {
  const db = getFirebaseDb()
  const role = await getMemberRole(circleId, uid)
  if (!role || role === 'subscriber') throw new Error('Только создатель или модератор может создать приглашение')

  const code = genCode()
  await addDoc(collection(db, 'circles', circleId, 'invites'), {
    code,
    createdBy: uid,
    createdAt: serverTimestamp(),
    uses: 0,
  })
  return code
}

/** Найти круг по коду приглашения */
export async function getCircleByInviteCode(code: string): Promise<Circle | null> {
  const db = getFirebaseDb()
  const circles = await getDocs(collection(db, 'circles'))
  for (const circleDoc of circles.docs) {
    const invites = await getDocs(query(collection(db, 'circles', circleDoc.id, 'invites'), where('code', '==', code)))
    if (!invites.empty) {
      return { id: circleDoc.id, ...circleDoc.data() } as Circle
    }
  }
  return null
}

import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp, query, where, collection } from 'firebase/firestore'
import { getFirebaseDb } from '@/services/firebase'
import type { Friendship } from '../types'

/** Создаёт ID документа для пары пользователей (сортировка) */
function friendshipId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_')
}

/** Получить документ дружбы между двумя пользователями */
export async function getFriendship(uid1: string, uid2: string): Promise<Friendship | null> {
  const db = getFirebaseDb()
  const ref = doc(db, 'friendships', friendshipId(uid1, uid2))
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Friendship
}

/** Отправить заявку в друзья (fromId → toId) */
export async function sendFriendRequest(fromId: string, toId: string): Promise<void> {
  const db = getFirebaseDb()
  const id = friendshipId(fromId, toId)
  await setDoc(doc(db, 'friendships', id), {
    user1: [fromId, toId].sort()[0],
    user2: [fromId, toId].sort()[1],
    actionUser: fromId,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

/** Принять заявку в друзья */
export async function acceptFriendRequest(uid1: string, uid2: string): Promise<void> {
  const db = getFirebaseDb()
  const ref = doc(db, 'friendships', friendshipId(uid1, uid2))
  await updateDoc(ref, { status: 'accepted' })
}

/** Удалить из друзей / отклонить / отменить заявку */
export async function removeFriendship(uid1: string, uid2: string): Promise<void> {
  const db = getFirebaseDb()
  const ref = doc(db, 'friendships', friendshipId(uid1, uid2))
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const data = snap.data()
  // actionUser — кто отправил заявку
  // Если отменяет actionUser (отправитель) — удаляем полностью
  if (data.actionUser === uid1) {
    await deleteDoc(ref)
    return
  }
  // Если отменяет не-actionUser (тот, кто принял) — возвращаем в pending
  if (data.status === 'accepted') {
    await updateDoc(ref, { status: 'pending' })
    return
  }
  // Если заявка ещё не принята — отклоняем (удаляем)
  await deleteDoc(ref)
}

/** Все дружеские связи пользователя */
export async function getUserFriendships(uid: string): Promise<Friendship[]> {
  const db = getFirebaseDb()
  const q1 = query(collection(db, 'friendships'), where('user1', '==', uid))
  const q2 = query(collection(db, 'friendships'), where('user2', '==', uid))
  const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)])
  return [...s1.docs, ...s2.docs].map((d) => ({ id: d.id, ...d.data() }) as Friendship)
}

/** Получить friendId (не текущий uid) из friendship */
export function getFriendId(f: Friendship, myUid: string): string {
  return f.user1 === myUid ? f.user2 : f.user1
}

/** Определить отношение текущего пользователя к другому */
export function getFriendRelation(f: Friendship | null, myUid: string): import('../types').FriendRelation {
  if (!f) return 'none'
  if (f.status === 'accepted') return 'friend'
  // pending: actionUser — кто отправил
  if (f.actionUser === myUid) return 'subscribed'
  return 'subscriber'
}

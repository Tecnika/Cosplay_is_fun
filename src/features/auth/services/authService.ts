import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, query, where, getDocs, collection } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from '@/services/firebase'
import type { UserProfile, Role } from '@/types'

const PLACEHOLDER_DOMAIN = '@cosplay.app'

export interface AuthProfile {
  user: User
  profile: UserProfile
}

/** Проверяет уникальность имени пользователя */
async function isUsernameTaken(username: string): Promise<boolean> {
  const db = getFirebaseDb()
  const q = query(collection(db, 'users'), where('displayName', '==', username))
  const snap = await getDocs(q)
  return !snap.empty
}

/** Генерирует email-заглушку из username */
function makePlaceholderEmail(username: string): string {
  return `${username.toLowerCase().replace(/[^a-z0-9]/g, '_')}${PLACEHOLDER_DOMAIN}`
}

/** Создаёт профиль в Firestore */
async function createUserProfile(
  uid: string,
  authEmail: string,
  displayName: string,
  realEmail?: string,
): Promise<UserProfile> {
  const db = getFirebaseDb()
  const existingUsers = await getDocs(collection(db, 'users'))
  const role: Role = existingUsers.empty ? 'superadmin' : 'user'

  const profile: UserProfile = {
    id: uid,
    displayName,
    role,
    createdAt: Date.now(),
  }

  // Если пользователь ввёл реальный email — сохраняем
  if (realEmail) {
    profile.email = realEmail
  }

  // Если authEmail — заглушка, не сохраняем её в профиль
  // Если authEmail — реальный email (не заглушка), сохраняем
  if (!realEmail && authEmail.endsWith(PLACEHOLDER_DOMAIN)) {
    // не сохраняем заглушку
  } else if (!realEmail) {
    profile.email = authEmail
  }

  await setDoc(doc(db, 'users', uid), {
    ...profile,
    createdAt: serverTimestamp(),
  })

  return profile
}

/** Регистрация */
export async function registerUser(
  displayName: string,
  password: string,
  email?: string,
): Promise<AuthProfile> {
  const auth = getFirebaseAuth()

  // Проверяем уникальность username
  const taken = await isUsernameTaken(displayName)
  if (taken) {
    throw new Error('Это имя пользователя уже занято')
  }

  // Определяем email для Firebase Auth
  const authEmail = email || makePlaceholderEmail(displayName)

  const credential = await createUserWithEmailAndPassword(auth, authEmail, password)
  const user = credential.user

  await updateProfile(user, { displayName })
  const profile = await createUserProfile(user.uid, authEmail, displayName, email)

  return { user, profile }
}

/** Поиск email по username в Firestore */
async function findEmailByUsername(username: string): Promise<string | null> {
  const db = getFirebaseDb()
  const q = query(collection(db, 'users'), where('displayName', '==', username))
  const snap = await getDocs(q)

  if (snap.empty) return null

  // У пользователя в Firestore может не быть поля email (если регился без почты).
  // В этом случае генерируем такой же placeholder
  const data = snap.docs[0].data() as UserProfile
  return data.email || makePlaceholderEmail(username)
}

/** Вход */
export async function loginUser(
  login: string,
  password: string,
): Promise<AuthProfile> {
  const auth = getFirebaseAuth()
  let authEmail = login

  // Если ввели не email — ищем username в Firestore
  if (!login.includes('@')) {
    const found = await findEmailByUsername(login)
    if (!found) {
      throw new Error('Пользователь с таким именем не найден')
    }
    authEmail = found
  }

  const credential = await signInWithEmailAndPassword(auth, authEmail, password)
  const user = credential.user

  const profile = await getUserProfile(user.uid)
  if (!profile) {
    throw new Error('Профиль пользователя не найден в базе данных')
  }

  return { user, profile }
}

/** Выход */
export async function logoutUser(): Promise<void> {
  const auth = getFirebaseAuth()
  await signOut(auth)
}

/** Сброс пароля */
export async function resetPassword(email: string): Promise<void> {
  const auth = getFirebaseAuth()
  await sendPasswordResetEmail(auth, email)
}

/** Загружает профиль из Firestore */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb()
  const docRef = doc(db, 'users', uid)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as UserProfile
}

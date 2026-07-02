import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from '@/services/firebase'
import { getCollection } from '@/services/firestore'
import type { UserProfile, Role } from '@/types'

/**
 * Сервис авторизации.
 * Регистрация: создаёт пользователя в Firebase Auth + документ в Firestore.
 * Первый зарегистрированный пользователь получает роль superadmin.
 */

/** Полный профиль пользователя (Auth + Firestore) */
export interface AuthProfile {
  user: User
  profile: UserProfile
}

/** Создаёт профиль в Firestore после регистрации */
async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
): Promise<UserProfile> {
  const db = getFirebaseDb()

  // Проверяем, есть ли уже пользователи в системе
  const existingUsers = await getCollection<UserProfile>('users')
  const role: Role = existingUsers.length === 0 ? 'superadmin' : 'user'

  const profile: UserProfile = {
    id: uid,
    email,
    displayName,
    role,
    createdAt: Date.now(),
  }

  // Сохраняем профиль в Firestore
  await setDoc(doc(db, 'users', uid), {
    ...profile,
    createdAt: serverTimestamp(),
  })

  return profile
}

/** Регистрация нового пользователя */
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthProfile> {
  const auth = getFirebaseAuth()
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const user = credential.user

  // Устанавливаем отображаемое имя
  await updateProfile(user, { displayName })

  // Создаём профиль в Firestore
  const profile = await createUserProfile(user.uid, email, displayName)

  return { user, profile }
}

/** Вход в систему */
export async function loginUser(
  email: string,
  password: string,
): Promise<AuthProfile> {
  const auth = getFirebaseAuth()
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const user = credential.user

  // Загружаем профиль из Firestore
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

/** Загружает профиль пользователя из Firestore */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb()
  const docRef = doc(db, 'users', uid)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return null

  return { id: docSnap.id, ...docSnap.data() } as UserProfile
}

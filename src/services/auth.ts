import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type UserCredential,
} from 'firebase/auth'
import { getFirebaseAuth } from './firebase'

/**
 * Регистрация нового пользователя по email и паролю.
 * @param email - Email пользователя
 * @param password - Пароль (минимум 6 символов)
 * @param displayName - Отображаемое имя (никнейм)
 */
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
): Promise<UserCredential> {
  const auth = getFirebaseAuth()
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  // Устанавливаем отображаемое имя сразу после регистрации
  await updateProfile(credential.user, { displayName })
  return credential
}

/**
 * Вход пользователя по email и паролю.
 */
export async function loginUser(email: string, password: string): Promise<UserCredential> {
  const auth = getFirebaseAuth()
  return signInWithEmailAndPassword(auth, email, password)
}

/**
 * Выход пользователя (завершение сессии).
 */
export async function logoutUser(): Promise<void> {
  const auth = getFirebaseAuth()
  return signOut(auth)
}

/**
 * Отправка письма для сброса пароля.
 */
export async function resetPassword(email: string): Promise<void> {
  const auth = getFirebaseAuth()
  return sendPasswordResetEmail(auth, email)
}

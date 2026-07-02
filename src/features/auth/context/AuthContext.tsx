import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { getFirebaseAuth } from '@/services/firebase'
import type { UserProfile } from '@/types'
import { getUserProfile, loginUser, registerUser, logoutUser } from '../services/authService'
import type { AuthProfile } from '../services/authService'

/**
 * Контекст авторизации.
 * Доступен во всём приложении через AuthProvider.
 */

export interface AuthContextValue {
  /** Текущий пользователь Firebase Auth (null если не авторизован) */
  user: User | null
  /** Профиль из Firestore с ролью */
  profile: UserProfile | null
  /** Загрузка данных */
  loading: boolean
  /** Авторизован ли пользователь */
  isAuthenticated: boolean
  /** Функция входа (login = username или email) */
  login: (login: string, password: string) => Promise<AuthProfile>
  /** Функция регистрации */
  register: (displayName: string, password: string, email?: string) => Promise<AuthProfile>
  /** Функция выхода */
  logout: () => Promise<void>
  /** Обновить профиль вручную */
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  /** Загружает профиль из Firestore по uid */
  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    const p = await getUserProfile(user.uid)
    setProfile(p)
  }, [user])

  /** Следим за состоянием аутентификации Firebase */
  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const p = await getUserProfile(firebaseUser.uid)
        setProfile(p)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = useCallback(async (login: string, password: string) => {
    const result = await loginUser(login, password)
    setUser(result.user)
    setProfile(result.profile)
    return result
  }, [])

  const register = useCallback(async (displayName: string, password: string, email?: string) => {
    const result = await registerUser(displayName, password, email)
    setUser(result.user)
    setProfile(result.profile)
    return result
  }, [])

  const logout = useCallback(async () => {
    await logoutUser()
    setUser(null)
    setProfile(null)
  }, [])

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

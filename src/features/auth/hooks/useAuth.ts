import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '../context/AuthContext'

/**
 * Хук для доступа к контексту авторизации.
 * Кидает ошибку, если используется вне AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return context
}

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { Role } from '@/types'
import { hasMinRole } from '../types'

interface UseRequireAuthOptions {
  /** Минимальная роль для доступа */
  requiredRole?: Role
  /** Куда редиректить если нет доступа */
  redirectTo?: string
}

/**
 * Хук для защиты страниц.
 * Если пользователь не авторизован — редирект на /auth.
 * Если роль ниже требуемой — редирект на /.
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { requiredRole, redirectTo = '/auth' } = options
  const { isAuthenticated, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      navigate(redirectTo, { replace: true })
      return
    }

    if (requiredRole && profile && !hasMinRole(profile.role, requiredRole)) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, profile, loading, requiredRole, redirectTo, navigate])

  return { isAuthenticated, profile, loading }
}

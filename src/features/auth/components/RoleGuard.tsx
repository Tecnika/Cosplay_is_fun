import type { ReactNode } from 'react'
import type { Role } from '@/types'
import { useAuth } from '../hooks/useAuth'
import { hasMinRole } from '../types'

interface RoleGuardProps {
  /** Минимальная роль для доступа к children */
  requiredRole: Role
  /** Что показывать если нет доступа */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Компонент для защиты частей UI по ролям.
 * Если у пользователя недостаточно прав — показывает fallback (или ничего).
 *
 * Пример:
 *   <RoleGuard requiredRole="admin">
 *     <AdminPanel />
 *   </RoleGuard>
 */
export function RoleGuard({ requiredRole, fallback = null, children }: RoleGuardProps) {
  const { profile, loading } = useAuth()

  if (loading) return null
  if (!profile) return fallback
  if (!hasMinRole(profile.role, requiredRole)) return fallback

  return <>{children}</>
}

/**
 * Типы модуля авторизации.
 * Роли вынесены в общие типы (@/types), здесь — локальные утилиты.
 */
import type { Role } from '@/types'

/** Иерархия ролей для проверки доступа (число = уровень) */
export const ROLE_HIERARCHY: Record<Role, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  superadmin: 3,
}

/** Проверяет, имеет ли роль достаточный уровень */
export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

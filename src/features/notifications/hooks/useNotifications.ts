import { useState, useEffect, useCallback } from 'react'
import type { AppNotification } from '@/types'
import { getUserNotifications, markAsRead, markAllAsRead } from '../services/notificationService'

interface UseNotificationsResult {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => Promise<void>
}

export function useNotifications(userId: string | undefined): UseNotificationsResult {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) { setNotifications([]); setLoading(false); return }
    setLoading(true)
    try {
      const data = await getUserNotifications(userId)
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      setNotifications(data)
    } catch {} finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const unreadCount = notifications.filter((n) => !n.read).length

  async function markRead(id: string) {
    await markAsRead(id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    if (!userId) return
    await markAllAsRead(userId)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return { notifications, unreadCount, loading, markRead, markAllRead, refresh: fetch }
}

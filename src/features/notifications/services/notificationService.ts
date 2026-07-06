import { where, orderBy } from 'firebase/firestore'
import { getCollection, createDocument, updateDocument } from '@/services/firestore'
import type { AppNotification } from '@/types'

const COLLECTION = 'notifications'

export async function getUserNotifications(userId: string): Promise<AppNotification[]> {
  return getCollection<AppNotification>(COLLECTION, [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  ])
}

export async function createNotification(data: Omit<AppNotification, 'id'>): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function markAsRead(notificationId: string): Promise<void> {
  return updateDocument(COLLECTION, notificationId, { read: true })
}

export async function markAllAsRead(userId: string): Promise<void> {
  const notifications = await getUserNotifications(userId)
  const unread = notifications.filter((n) => !n.read)
  await Promise.all(unread.map((n) => markAsRead(n.id)))
}

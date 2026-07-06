import { where } from 'firebase/firestore'
import { getDocument, getCollection, createDocument, updateDocument, deleteDocument } from '@/services/firestore'
import type { Costume } from '@/types'

const COLLECTION = 'costumes'

export async function getCostume(id: string): Promise<Costume | null> {
  return getDocument<Costume>(COLLECTION, id)
}

/** Созданные пользователем */
export async function getUserCostumes(userId: string): Promise<Costume[]> {
  return getCollection<Costume>(COLLECTION, [
    where('userId', '==', userId),
  ])
}

/** Назначенные пользователю */
export async function getAssignedCostumes(userId: string): Promise<Costume[]> {
  return getCollection<Costume>(COLLECTION, [
    where('assignedTo', '==', userId),
  ])
}

export async function createCostume(data: Omit<Costume, 'id'>): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function updateCostume(id: string, data: Partial<Costume>): Promise<void> {
  return updateDocument(COLLECTION, id, data)
}

export async function deleteCostume(id: string): Promise<void> {
  return deleteDocument(COLLECTION, id)
}

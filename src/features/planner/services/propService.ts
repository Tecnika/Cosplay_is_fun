import { where } from 'firebase/firestore'
import { getDocument, getCollection, createDocument, updateDocument, deleteDocument } from '@/services/firestore'
import type { WorkshopProp } from '@/types'

const COLLECTION = 'workshop_props'

export async function getProp(id: string): Promise<WorkshopProp | null> {
  return getDocument<WorkshopProp>(COLLECTION, id)
}

export async function getUserProps(userId: string): Promise<WorkshopProp[]> {
  return getCollection<WorkshopProp>(COLLECTION, [
    where('userId', '==', userId),
  ])
}

export async function getAssignedProps(userId: string): Promise<WorkshopProp[]> {
  return getCollection<WorkshopProp>(COLLECTION, [
    where('assignedTo', '==', userId),
  ])
}

export async function createProp(data: Omit<WorkshopProp, 'id'>): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function updateProp(id: string, data: Partial<WorkshopProp>): Promise<void> {
  return updateDocument(COLLECTION, id, data)
}

export async function deleteProp(id: string): Promise<void> {
  return deleteDocument(COLLECTION, id)
}

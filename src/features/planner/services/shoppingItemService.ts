import { where, writeBatch, doc, collection, getDocs, query } from 'firebase/firestore'
import { getCollection, createDocument, updateDocument, deleteDocument } from '@/services/firestore'
import { getFirebaseDb } from '@/services/firebase'
import type { ShoppingItem } from '@/types'

const COLLECTION = 'shoppingItems'
const COSTUME_LINKS = 'projectCostumes'
const PROP_LINKS = 'projectProps'

export async function getSourceShopItems(sourceType: string, sourceId: string): Promise<ShoppingItem[]> {
  return getCollection<ShoppingItem>(COLLECTION, [
    where('sourceType', '==', sourceType),
    where('sourceId', '==', sourceId),
  ])
}

export async function getProjectShopItems(projectId: string): Promise<ShoppingItem[]> {
  return getCollection<ShoppingItem>(COLLECTION, [
    where('linkedTo', 'array-contains', projectId),
  ])
}

export async function createShopItem(data: Omit<ShoppingItem, 'id'>): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function updateShopItem(id: string, data: Partial<ShoppingItem>): Promise<void> {
  return updateDocument(COLLECTION, id, data)
}

export async function deleteShopItem(id: string): Promise<void> {
  return deleteDocument(COLLECTION, id)
}

export async function getSourceProjectIds(sourceType: string, sourceId: string): Promise<string[]> {
  const db = getFirebaseDb()
  const linksCol = sourceType === 'costume' ? COSTUME_LINKS : PROP_LINKS
  const otherField = sourceType === 'costume' ? 'costumeId' : 'propId'
  const snaps = await getDocs(query(collection(db, linksCol), where(otherField, '==', sourceId)))
  return snaps.docs.map((d) => d.data().projectId)
}

export async function replaceSourceShopItems(sourceType: string, sourceId: string, userId: string, items: { item: string; forWhat: string; link?: string; price?: number; quantity: number }[]): Promise<void> {
  const db = getFirebaseDb()
  const old = await getSourceShopItems(sourceType, sourceId)
  const batch = writeBatch(db)
  old.forEach((item) => { batch.delete(doc(db, COLLECTION, item.id)) })
  const now = Date.now()
  const projectIds = await getSourceProjectIds(sourceType, sourceId)
  items.forEach((it, i) => {
    const ref = doc(collection(db, COLLECTION))
    batch.set(ref, { ...it, id: ref.id, userId, sourceType, sourceId, linkedTo: projectIds, createdAt: now + i, status: 'to_buy' as const, statusNote: '' })
  })
  await batch.commit()
}

export async function linkItemsToProject(sourceType: string, sourceId: string, projectId: string): Promise<void> {
  const items = await getSourceShopItems(sourceType, sourceId)
  if (items.length === 0) return
  const db = getFirebaseDb()
  const batch = writeBatch(db)
  items.forEach((item) => {
    const linkedTo = [...(item.linkedTo || [])]
    if (!linkedTo.includes(projectId)) linkedTo.push(projectId)
    batch.update(doc(db, COLLECTION, item.id), { linkedTo })
  })
  await batch.commit()
}

export async function unlinkItemsFromProject(sourceType: string, sourceId: string, projectId: string): Promise<void> {
  const items = await getSourceShopItems(sourceType, sourceId)
  if (items.length === 0) return
  const db = getFirebaseDb()
  const batch = writeBatch(db)
  items.forEach((item) => {
    const linkedTo = (item.linkedTo || []).filter((id) => id !== projectId)
    batch.update(doc(db, COLLECTION, item.id), { linkedTo })
  })
  await batch.commit()
}

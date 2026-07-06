import { where, arrayUnion, arrayRemove, collection, getDocs, query, addDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore'
import { getDocument, getCollection, createDocument, updateDocument } from '@/services/firestore'
import { getFirebaseDb } from '@/services/firebase'
import { linkItemsToProject, unlinkItemsFromProject } from './shoppingItemService'
import type { WorkshopProject } from '@/types'

const COLLECTION = 'workshop_projects'
const COSTUME_LINKS = 'projectCostumes'
const PROP_LINKS = 'projectProps'

export async function getProject(id: string): Promise<WorkshopProject | null> {
  return getDocument<WorkshopProject>(COLLECTION, id)
}

export async function getUserProjects(userId: string): Promise<WorkshopProject[]> {
  return getCollection<WorkshopProject>(COLLECTION, [
    where('members', 'array-contains', userId),
  ])
}

export async function createProject(data: Omit<WorkshopProject, 'id'>): Promise<string> {
  return createDocument(COLLECTION, data)
}

export async function updateProject(id: string, data: Partial<WorkshopProject>): Promise<void> {
  return updateDocument(COLLECTION, id, data)
}

export async function deleteProject(id: string, userId: string): Promise<void> {
  const project = await getProject(id)
  if (!project) return
  if (project.ownerId === userId) {
    const db = getFirebaseDb()
    const [costumeLinks, propLinks] = await Promise.all([
      getDocs(query(collection(db, COSTUME_LINKS), where('projectId', '==', id))),
      getDocs(query(collection(db, PROP_LINKS), where('projectId', '==', id))),
    ])
    const batch = writeBatch(db)
    costumeLinks.forEach((d) => batch.delete(d.ref))
    propLinks.forEach((d) => batch.delete(d.ref))
    batch.delete(doc(db, COLLECTION, id))
    await batch.commit()
  }
}

export async function addMember(projectId: string, userId: string): Promise<void> {
  return updateDocument(COLLECTION, projectId, { members: arrayUnion(userId) })
}

export async function removeMember(projectId: string, userId: string): Promise<void> {
  return updateDocument(COLLECTION, projectId, { members: arrayRemove(userId) })
}

export async function addCostumeToProject(projectId: string, costumeId: string): Promise<void> {
  const db = getFirebaseDb()
  const existing = await getDocs(query(collection(db, COSTUME_LINKS), where('projectId', '==', projectId), where('costumeId', '==', costumeId)))
  if (!existing.empty) return
  await addDoc(collection(db, COSTUME_LINKS), { projectId, costumeId, addedAt: Date.now() })
  await linkItemsToProject('costume', costumeId, projectId)
}

export async function removeCostumeFromProject(projectId: string, costumeId: string): Promise<void> {
  const db = getFirebaseDb()
  const existing = await getDocs(query(collection(db, COSTUME_LINKS), where('projectId', '==', projectId), where('costumeId', '==', costumeId)))
  await Promise.all(existing.docs.map((d) => deleteDoc(d.ref)))
  await unlinkItemsFromProject('costume', costumeId, projectId)
}

export async function addPropToProject(projectId: string, propId: string): Promise<void> {
  const db = getFirebaseDb()
  const existing = await getDocs(query(collection(db, PROP_LINKS), where('projectId', '==', projectId), where('propId', '==', propId)))
  if (!existing.empty) return
  await addDoc(collection(db, PROP_LINKS), { projectId, propId, addedAt: Date.now() })
  await linkItemsToProject('prop', propId, projectId)
}

export async function removePropFromProject(projectId: string, propId: string): Promise<void> {
  const db = getFirebaseDb()
  const existing = await getDocs(query(collection(db, PROP_LINKS), where('projectId', '==', projectId), where('propId', '==', propId)))
  await Promise.all(existing.docs.map((d) => deleteDoc(d.ref)))
  await unlinkItemsFromProject('prop', propId, projectId)
}

export async function getProjectCostumeIds(projectId: string): Promise<string[]> {
  const db = getFirebaseDb()
  const snaps = await getDocs(query(collection(db, COSTUME_LINKS), where('projectId', '==', projectId)))
  return snaps.docs.map((d) => d.data().costumeId)
}

export async function getProjectPropIds(projectId: string): Promise<string[]> {
  const db = getFirebaseDb()
  const snaps = await getDocs(query(collection(db, PROP_LINKS), where('projectId', '==', projectId)))
  return snaps.docs.map((d) => d.data().propId)
}

export async function transferOwnership(projectId: string, newOwnerId: string): Promise<void> {
  return updateDocument(COLLECTION, projectId, { ownerId: newOwnerId })
}

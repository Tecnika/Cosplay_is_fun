import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
  type QueryConstraint,
  type FirestoreError,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

/**
 * Firestore — обёртка для работы с базой данных Firebase.
 * Все функции принимают название коллекции и данные.
 * Обработка ошибок на вызывающей стороне.
 */

/** Получить документ по ID */
export async function getDocument<T = DocumentData>(collectionName: string, docId: string): Promise<T | null> {
  const db = getFirebaseDb()
  const docRef = doc(db, collectionName, docId)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as T) : null
}

/** Получить все документы коллекции (с опциональными фильтрами) */
export async function getCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  const db = getFirebaseDb()
  const q = query(collection(db, collectionName), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T)
}

/** Удалить ключи со значением undefined (Firestore не принимает undefined) */
function stripUndefined(data: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = value
    }
  }
  return clean
}

/** Создать документ (авто-ID) */
export async function createDocument<T = DocumentData>(
  collectionName: string,
  data: T,
): Promise<string> {
  const db = getFirebaseDb()
  const clean = stripUndefined(data as Record<string, unknown>)
  const docRef = await addDoc(collection(db, collectionName), clean)
  return docRef.id
}

/** Обновить существующий документ */
export async function updateDocument<T = DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>,
): Promise<void> {
  const db = getFirebaseDb()
  const docRef = doc(db, collectionName, docId)
  const clean = stripUndefined(data as Record<string, unknown>)
  await updateDoc(docRef, clean)
}

/** Удалить документ */
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  const db = getFirebaseDb()
  const docRef = doc(db, collectionName, docId)
  await deleteDoc(docRef)
}

// Экспортируем утилиты Firestore для удобства
export { collection, doc, query, where, orderBy, limit }
export type { QueryConstraint, FirestoreError }

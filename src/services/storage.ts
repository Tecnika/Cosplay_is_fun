import { ref, uploadBytes, getDownloadURL, deleteObject, type UploadResult } from 'firebase/storage'
import { getFirebaseStorage } from './firebase'

/**
 * Firebase Storage — загрузка/удаление файлов.
 * Путь хранения: /users/{userId}/{filename}
 */

/** Загрузить файл в хранилище */
export async function uploadFile(
  userId: string,
  filename: string,
  blob: Blob | Uint8Array | ArrayBuffer,
): Promise<UploadResult> {
  const storage = getFirebaseStorage()
  const storageRef = ref(storage, `users/${userId}/${filename}`)
  return uploadBytes(storageRef, blob)
}

/** Получить публичную ссылку на файл */
export async function getFileUrl(userId: string, filename: string): Promise<string> {
  const storage = getFirebaseStorage()
  const storageRef = ref(storage, `users/${userId}/${filename}`)
  return getDownloadURL(storageRef)
}

/** Удалить файл */
export async function deleteFile(userId: string, filename: string): Promise<void> {
  const storage = getFirebaseStorage()
  const storageRef = ref(storage, `users/${userId}/${filename}`)
  await deleteObject(storageRef)
}

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

/**
 * Конфигурация Firebase.
 * Значения берутся из переменных окружения (.env файл).
 * См. .env.example для списка необходимых переменных.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Singleton-экземпляры Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

/**
 * Инициализирует Firebase и возвращает объекты для работы.
 * Вызывается однократно при старте приложения.
 */
export function initFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore; storage: FirebaseStorage } {
  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  }
  return { app, auth, db, storage }
}

/**
 * Геттеры для ленивого получения инстансов.
 * initFirebase() должен быть вызван перед их использованием.
 */

export function getFirebaseApp(): FirebaseApp {
  if (!app) throw new Error('Firebase не инициализирован. Вызови initFirebase()')
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) throw new Error('Firebase Auth не инициализирован. Вызови initFirebase()')
  return auth
}

export function getFirebaseDb(): Firestore {
  if (!db) throw new Error('Firestore не инициализирован. Вызови initFirebase()')
  return db
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) throw new Error('Storage не инициализирован. Вызови initFirebase()')
  return storage
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initFirebase } from './services/firebase'
import './index.css'

try {
  localStorage.setItem('firebase:devmode', 'false')
} catch {}

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

const missing = requiredEnvVars.filter((key) => !import.meta.env[key])

function renderApp() {
  const root = document.getElementById('root')
  if (!root) return
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

if (missing.length > 0) {
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: sans-serif;">
      <h2>Firebase не настроен</h2>
      <p>Скопируй <code>.env.example</code> в <code>.env</code> и заполни данные из Firebase Console.</p>
      <p style="color: #e17055;">Отсутствуют: ${missing.join(', ')}</p>
    </div>
  `
} else {
  try {
    initFirebase()
    renderApp()
  } catch (err) {
    document.getElementById('root')!.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif;">
        <h2>Ошибка инициализации</h2>
        <p style="color: #e17055;">${err instanceof Error ? err.message : 'Неизвестная ошибка'}</p>
      </div>
    `
  }
}

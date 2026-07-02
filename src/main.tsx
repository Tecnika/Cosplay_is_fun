import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initFirebase } from './services/firebase'
import './index.css'

// Подавляем баннер Firebase Dev Mode
localStorage.setItem('firebase:devmode', 'false')

/** Проверяем, что .env настроен */
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
] as const

const missing = requiredEnvVars.filter((key) => !import.meta.env[key])
if (missing.length > 0) {
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: sans-serif;">
      <h2>Firebase не настроен</h2>
      <p>Скопируй <code>.env.example</code> в <code>.env</code> и заполни данные из Firebase Console.</p>
      <p style="color: #e17055;">Отсутствуют: ${missing.join(', ')}</p>
    </div>
  `
} else {
  // Инициализируем Firebase до монтирования React
  initFirebase()

  const root = document.getElementById('root')
  createRoot(root!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

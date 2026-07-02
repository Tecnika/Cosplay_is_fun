import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

/**
 * Точка входа в приложение.
 * Инициализация Firebase происходит после монтирования React.
 */

const root = document.getElementById('root')
if (!root) throw new Error('Корневой элемент #root не найден')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { useTheme } from '@/hooks/useTheme'
import styles from './Layout.module.css'

/**
 * Основной макет приложения.
 * Содержит Header, основную область (Outlet) и Footer.
 */

// TODO: заменить на реальный статус авторизации
const MOCK_AUTH = false

export function Layout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        isAuthenticated={MOCK_AUTH}
      />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

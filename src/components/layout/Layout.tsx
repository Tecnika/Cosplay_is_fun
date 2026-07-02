import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/features/auth/hooks/useAuth'
import styles from './Layout.module.css'

export function Layout() {
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, logout } = useAuth()

  return (
    <>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
      />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

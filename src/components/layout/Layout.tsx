import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import styles from './Layout.module.css'

export function Layout() {
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, profile, logout } = useAuth()
  const { unreadCount, notifications, markRead, markAllRead } = useNotifications(user?.uid)

  return (
    <>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        isAuthenticated={isAuthenticated}
        userName={profile?.displayName}
        userAvatar={profile?.photoURL}
        onLogout={logout}
        unreadCount={unreadCount}
        notifications={notifications}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

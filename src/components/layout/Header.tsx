import { Link } from 'react-router-dom'
import type { Theme } from '@/types'
import { Avatar } from '@/features/profile/components/Avatar'
import styles from './Header.module.css'

interface HeaderProps {
  theme: Theme
  onToggleTheme: () => void
  isAuthenticated: boolean
  userName?: string
  userAvatar?: string
  onLogout?: () => void
}

export function Header({ theme, onToggleTheme, isAuthenticated, userName, userAvatar, onLogout }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          Cosplay is Fun
        </Link>

        <nav className={styles.nav}>
          <Link to="/planner" className={styles.link}>Планировщик</Link>
          <Link to="/social" className={styles.link}>Лента</Link>
          <Link to="/gallery" className={styles.link}>Галерея</Link>
        </nav>

        <div className={styles.actions}>
          <button
            onClick={onToggleTheme}
            className={styles.themeBtn}
            aria-label={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/profile" className={styles.profileLink}>
                <Avatar name={userName || ''} url={userAvatar} size={32} />
                <span className={styles.nick}>{userName}</span>
              </Link>
              <button onClick={onLogout} className={styles.logoutBtn}>Выйти</button>
            </>
          ) : (
            <Link to="/auth" className={styles.authBtn}>Войти</Link>
          )}
        </div>
      </div>
    </header>
  )
}

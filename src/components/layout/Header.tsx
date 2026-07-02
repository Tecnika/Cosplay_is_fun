import { Link } from 'react-router-dom'
import type { Theme } from '@/types'
import styles from './Header.module.css'

interface HeaderProps {
  theme: Theme
  onToggleTheme: () => void
  isAuthenticated: boolean
  onLogout?: () => void
}

export function Header({ theme, onToggleTheme, isAuthenticated, onLogout }: HeaderProps) {
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
              <Link to="/profile" className={styles.profileBtn}>Профиль</Link>
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

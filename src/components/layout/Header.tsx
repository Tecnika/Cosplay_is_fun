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
          <span className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="8" x2="12" y2="22" />
              <polygon className={styles.wandStar} points="12 2 13.5 6 18 6.5 14.5 9.5 15.5 14 12 11.5 8.5 14 9.5 9.5 6 6.5 10.5 6" fill="var(--color-accent)" stroke="var(--color-accent)" />
            </svg>
          </span>
          <span className={styles.logoText}>
            <span className={styles.logoTitle}>
              Cosplay is <span className={styles.logoAccent}>Fun</span>
            </span>
            <span className={styles.logoSub}>сообщество косплееров</span>
          </span>
          <span className={styles.logoSparkle}>✦</span>
        </Link>

        <nav className={styles.nav}>
          {isAuthenticated && (
            <>
              <Link to="/social/users" className={styles.link}>Участники</Link>
              <Link to="/social/friends" className={styles.link}>Друзья</Link>
              <Link to="/social/circles" className={styles.link}>Круги</Link>
            </>
          )}
          <Link to="/planner" className={styles.link}>Планировщик</Link>
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
            <div className={styles.profileDropdown}>
              <Link to="/profile" className={styles.profileLink}>
                <Avatar name={userName || ''} url={userAvatar} size={32} />
                <span className={styles.nick}>{userName}</span>
              </Link>
              <div className={styles.dropdownMenu}>
                <Link to="/profile/settings" className={styles.dropdownItem}>Настройки</Link>
                <button onClick={onLogout} className={styles.dropdownItem}>Выйти</button>
              </div>
            </div>
          ) : (
            <Link to="/auth" className={styles.authBtn}>Войти</Link>
          )}
        </div>
      </div>
    </header>
  )
}

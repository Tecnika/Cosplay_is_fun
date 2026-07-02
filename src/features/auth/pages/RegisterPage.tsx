import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './AuthPage.module.css'

export function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (displayName.length < 2) {
      setError('Имя должно быть минимум 2 символа')
      return
    }

    if (password.length < 6) {
      setError('Пароль должен быть минимум 6 символов')
      return
    }

    try {
      // Передаём email только если он заполнен
      await register(displayName, password, email || undefined)
      navigate('/profile', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка регистрации'
      setError(msg)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>Регистрация</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <label className={styles.field}>
            <span>Имя пользователя *</span>
            <input
              type="text"
              placeholder="Ваш никнейм"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              minLength={2}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Пароль *</span>
            <input
              type="password"
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Email (необязательно)</span>
            <input
              type="email"
              placeholder="cosplayer@mail.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <button type="submit" className={styles.submitBtn}>
            Зарегистрироваться
          </button>
        </form>

        <p className={styles.switch}>
          Уже есть аккаунт? <Link to="/auth" className={styles.linkBtn}>Войти</Link>
        </p>
      </div>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './AuthPage.module.css'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate('/profile', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка входа'
      setError(msg)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>Вход</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              placeholder="cosplayer@mail.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Пароль</span>
            <input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className={styles.submitBtn}>Войти</button>
        </form>

        <p className={styles.switch}>
          Нет аккаунта? <Link to="/auth/register" className={styles.linkBtn}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}

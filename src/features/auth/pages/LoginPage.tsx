import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './AuthPage.module.css'

export function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const { login: authLogin, resetPassword } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    try {
      await authLogin(login, password)
      navigate('/profile', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка входа'
      setError(msg)
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault()
    setError('')

    try {
      const email = await resetPassword(resetEmail)
      setResetSent(true)
      setError(`Письмо отправлено на ${email}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка'
      setError(msg)
    }
  }

  if (resetMode) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h2 className={styles.title}>Сброс пароля</h2>

          <form className={styles.form} onSubmit={handleReset}>
            {error && <div className={resetSent ? styles.success : styles.error}>{error}</div>}

            <label className={styles.field}>
              <span>Имя пользователя или Email</span>
              <input
                type="text"
                placeholder="Ваш ник или email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </label>

            <button type="submit" className={styles.submitBtn}>Отправить</button>
          </form>

          <p className={styles.switch}>
            <button onClick={() => { setResetMode(false); setError(''); setResetSent(false) }} className={styles.linkBtn}>
              ← Назад к входу
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>Вход</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <label className={styles.field}>
            <span>Имя пользователя или Email</span>
            <input
              type="text"
              placeholder="Ваш ник или email"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
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

        <div className={styles.switch}>
          <button onClick={() => setResetMode(true)} className={styles.linkBtn}>
            Забыли пароль?
          </button>
        </div>

        <p className={styles.switch}>
          Нет аккаунта? <Link to="/auth/register" className={styles.linkBtn}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}

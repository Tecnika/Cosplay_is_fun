import { useState } from 'react'
import styles from './Auth.module.css'

type AuthMode = 'login' | 'register'

export function Auth() {
  const [mode, setMode] = useState<AuthMode>('login')

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'))
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h2>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.field}>
            <span>Email</span>
            <input type="email" placeholder="cosplayer@mail.ru" required />
          </label>

          {mode === 'register' && (
            <label className={styles.field}>
              <span>Имя (никнейм)</span>
              <input type="text" placeholder="Ваш ник" required />
            </label>
          )}

          <label className={styles.field}>
            <span>Пароль</span>
            <input type="password" placeholder="••••••" required />
          </label>

          <button type="submit" className={styles.submitBtn}>
            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className={styles.switch}>
          {mode === 'login' ? (
            <>Нет аккаунта? <button onClick={toggleMode} className={styles.linkBtn}>Зарегистрироваться</button></>
          ) : (
            <>Уже есть аккаунт? <button onClick={toggleMode} className={styles.linkBtn}>Войти</button></>
          )}
        </p>
      </div>
    </div>
  )
}

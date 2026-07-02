import { useState, useEffect, useCallback } from 'react'
import type { Theme } from '@/types'

const STORAGE_KEY = 'cosplay-theme'

/**
 * Хук для переключения темы (светлая/тёмная).
 * Сохраняет выбор в localStorage.
 * Применяет data-theme атрибут к <html>.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    return saved ?? 'light'
  })

  // Применяем тему к DOM при каждом изменении
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  return { theme, toggleTheme, setTheme }
}

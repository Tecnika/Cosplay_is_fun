import { useState, useEffect, useCallback } from 'react'
import type { Theme, ColorTheme, StyleVariant, DesignSettings } from '@/types'

const STORAGE_KEY = 'cosplay-theme'
const COLOR_KEY = 'cosplay-color'
const STYLE_KEY = 'cosplay-style'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try { return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'light' } catch { return 'light' }
  })

  const [design, setDesignState] = useState<DesignSettings>(() => {
    try {
      return {
        colorTheme: (localStorage.getItem(COLOR_KEY) as ColorTheme) ?? 'cosplay',
        styleVariant: (localStorage.getItem(STYLE_KEY) as StyleVariant) ?? 'rounded',
      }
    } catch {
      return { colorTheme: 'cosplay', styleVariant: 'rounded' }
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-color-theme', design.colorTheme)
    document.documentElement.setAttribute('data-style', design.styleVariant)
    try { localStorage.setItem(COLOR_KEY, design.colorTheme) } catch {}
    try { localStorage.setItem(STYLE_KEY, design.styleVariant) } catch {}
  }, [design])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const setDesign = useCallback((update: Partial<DesignSettings>) => {
    setDesignState((prev) => ({ ...prev, ...update }))
  }, [])

  return { theme, design, toggleTheme, setTheme, setDesign }
}

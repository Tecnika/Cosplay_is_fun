import { useState, useEffect, useCallback } from 'react'
import type { WorkshopProp } from '@/types'
import { getUserProps, getAssignedProps } from '../services/propService'

interface UsePropsResult {
  props: WorkshopProp[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useProps(userId: string | undefined): UsePropsResult {
  const [props, setProps] = useState<WorkshopProp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (ignoreRef?: { current: boolean }) => {
    if (!userId) { setProps([]); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const [created, assigned] = await Promise.all([
        getUserProps(userId),
        getAssignedProps(userId),
      ])
      if (ignoreRef?.current) return
      const merged = [...created, ...assigned]
      const seen = new Set<string>()
      const unique = merged.filter((p) => {
        if (seen.has(p.id)) return false
        seen.add(p.id)
        return true
      })
      unique.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      setProps(unique)
    } catch (err) {
      if (ignoreRef?.current) return
      setError(err instanceof Error ? err.message : 'Ошибка загрузки реквизита')
    } finally {
      if (!ignoreRef?.current) setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    const ignoreRef = { current: false }
    fetch(ignoreRef)
    return () => { ignoreRef.current = true }
  }, [fetch])

  return { props, loading, error, refresh: () => fetch() }
}

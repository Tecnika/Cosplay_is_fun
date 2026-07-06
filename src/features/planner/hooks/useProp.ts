import { useState, useEffect, useCallback } from 'react'
import type { WorkshopProp } from '@/types'
import { getProp } from '../services/propService'

interface UsePropResult {
  prop: WorkshopProp | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useProp(id: string | undefined): UsePropResult {
  const [prop, setProp] = useState<WorkshopProp | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (ignoreRef?: { current: boolean }) => {
    if (!id) { setProp(null); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await getProp(id)
      if (ignoreRef?.current) return
      setProp(data)
    } catch (err) {
      if (ignoreRef?.current) return
      setError(err instanceof Error ? err.message : 'Ошибка загрузки реквизита')
    } finally {
      if (!ignoreRef?.current) setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const ignoreRef = { current: false }
    fetch(ignoreRef)
    return () => { ignoreRef.current = true }
  }, [fetch])

  return { prop, loading, error, refresh: () => fetch() }
}

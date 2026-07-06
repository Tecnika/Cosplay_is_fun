import { useState, useEffect, useCallback } from 'react'
import type { Costume } from '@/types'
import { getCostume } from '../services/costumeService'

interface UseCostumeResult {
  costume: Costume | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useCostume(id: string | undefined): UseCostumeResult {
  const [costume, setCostume] = useState<Costume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (ignoreRef?: { current: boolean }) => {
    if (!id) { setCostume(null); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await getCostume(id)
      if (ignoreRef?.current) return
      setCostume(data)
    } catch (err) {
      if (ignoreRef?.current) return
      setError(err instanceof Error ? err.message : 'Ошибка загрузки образа')
    } finally {
      if (!ignoreRef?.current) setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const ignoreRef = { current: false }
    fetch(ignoreRef)
    return () => { ignoreRef.current = true }
  }, [fetch])

  return { costume, loading, error, refresh: fetch }
}

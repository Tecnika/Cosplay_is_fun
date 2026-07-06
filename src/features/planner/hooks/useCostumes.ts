import { useState, useEffect, useCallback } from 'react'
import type { Costume } from '@/types'
import { getUserCostumes, getAssignedCostumes } from '../services/costumeService'

interface UseCostumesResult {
  costumes: Costume[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useCostumes(userId: string | undefined): UseCostumesResult {
  const [costumes, setCostumes] = useState<Costume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (ignoreRef?: { current: boolean }) => {
    if (!userId) { setCostumes([]); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const [created, assigned] = await Promise.all([
        getUserCostumes(userId),
        getAssignedCostumes(userId),
      ])
      if (ignoreRef?.current) return
      const merged = [...created, ...assigned]
      const seen = new Set<string>()
      const unique = merged.filter((c) => {
        if (seen.has(c.id)) return false
        seen.add(c.id)
        return true
      })
      unique.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      setCostumes(unique)
    } catch (err) {
      if (ignoreRef?.current) return
      setError(err instanceof Error ? err.message : 'Ошибка загрузки образов')
    } finally {
      if (!ignoreRef?.current) setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    const ignoreRef = { current: false }
    fetch(ignoreRef)
    return () => { ignoreRef.current = true }
  }, [fetch])

  return { costumes, loading, error, refresh: () => fetch() }
}

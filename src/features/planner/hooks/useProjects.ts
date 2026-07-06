import { useState, useEffect, useCallback } from 'react'
import type { WorkshopProject } from '@/types'
import { getUserProjects } from '../services/projectService'

interface UseProjectsResult {
  projects: WorkshopProject[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useProjects(userId: string | undefined): UseProjectsResult {
  const [projects, setProjects] = useState<WorkshopProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (ignoreRef?: { current: boolean }) => {
    if (!userId) { setProjects([]); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await getUserProjects(userId)
      if (ignoreRef?.current) return
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      setProjects(data)
    } catch (err) {
      if (ignoreRef?.current) return
      setError(err instanceof Error ? err.message : 'Ошибка загрузки проектов')
    } finally {
      if (!ignoreRef?.current) setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    const ignoreRef = { current: false }
    fetch(ignoreRef)
    return () => { ignoreRef.current = true }
  }, [fetch])

  return { projects, loading, error, refresh: () => fetch() }
}

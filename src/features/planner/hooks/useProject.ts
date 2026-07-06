import { useState, useEffect, useCallback } from 'react'
import type { WorkshopProject } from '@/types'
import { getProject } from '../services/projectService'

interface UseProjectResult {
  project: WorkshopProject | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useProject(id: string | undefined): UseProjectResult {
  const [project, setProject] = useState<WorkshopProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (ignoreRef?: { current: boolean }) => {
    if (!id) { setProject(null); setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await getProject(id)
      if (ignoreRef?.current) return
      setProject(data)
    } catch (err) {
      if (ignoreRef?.current) return
      setError(err instanceof Error ? err.message : 'Ошибка загрузки проекта')
    } finally {
      if (!ignoreRef?.current) setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const ignoreRef = { current: false }
    fetch(ignoreRef)
    return () => { ignoreRef.current = true }
  }, [fetch])

  return { project, loading, error, refresh: () => fetch() }
}

import { useState, useEffect } from 'react'
import type { Circle } from '../types'
import { getUserCircles } from '../services/circlesService'

interface UseCirclesResult {
  circles: Circle[]
  loading: boolean
}

export function useCircles(uid: string | undefined): UseCirclesResult {
  const [circles, setCircles] = useState<Circle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setLoading(false); return }

    let cancelled = false
    getUserCircles(uid).then((data) => {
      if (!cancelled) { setCircles(data); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [uid])

  return { circles, loading }
}

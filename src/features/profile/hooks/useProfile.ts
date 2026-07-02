import { useState, useEffect } from 'react'
import type { UserProfile } from '@/types'
import { getProfileById } from '../services/profileService'

interface UseProfileResult {
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export function useProfile(uid: string | undefined): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load(id: string) {
      try {
        const data = await getProfileById(id)
        if (!cancelled) {
          setProfile(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки профиля')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load(uid)
    return () => { cancelled = true }
  }, [uid])

  return { profile, loading, error }
}

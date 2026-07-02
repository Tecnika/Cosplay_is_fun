import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/features/profile/components/Avatar'
import { getProfileById } from '@/features/profile/services/profileService'
import type { UserProfile } from '@/types'
import styles from './UserPreview.module.css'

interface UserPreviewProps {
  uid: string
  size?: number
}

export function UserPreview({ uid, size = 40 }: UserPreviewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!uid) return
    let cancelled = false
    getProfileById(uid).then((p) => {
      if (!cancelled) setProfile(p)
    })
    return () => { cancelled = true }
  }, [uid])

  const displayName = profile?.displayName || uid.slice(0, 8)
  const photoURL = profile?.photoURL

  return (
    <Link to={`/profile/${profile?.displayName || uid}`} className={styles.link}>
      <Avatar name={displayName} url={photoURL} size={size} />
      <span className={styles.name}>{displayName}</span>
    </Link>
  )
}

import { useState, useEffect, useRef } from 'react'
import { getDocs, collection } from 'firebase/firestore'
import { getFirebaseDb } from '@/services/firebase'
import type { UserProfile } from '@/types'
import styles from './MemberSearch.module.css'

interface MemberSearchProps {
  exclude: string[]
  onSelect: (uid: string, displayName: string) => void
}

export function MemberSearch({ exclude, onSelect }: MemberSearchProps) {
  const [query, setQuery] = useState('')
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [open, setOpen] = useState(false)
  const [usersLoading, setUsersLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const db = getFirebaseDb()
    setUsersLoading(true)
    getDocs(collection(db, 'users')).then((snap) => {
      setAllUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserProfile))
    }).catch(() => {}).finally(() => setUsersLoading(false))
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = query.trim()
    ? allUsers.filter(
        (u) =>
          !exclude.includes(u.id) &&
          u.displayName.toLowerCase().includes(query.toLowerCase()),
      )
    : []

  function selectUser(u: UserProfile) {
    onSelect(u.id, u.displayName)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className={styles.wrapper} ref={ref}>
      <input
        className={styles.input}
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Поиск по имени..."
      />
      {open && (
        <div className={styles.dropdown}>
          {usersLoading && <div className={styles.status}>Загрузка...</div>}
          {!usersLoading && query.trim() && filtered.length === 0 && (
            <div className={styles.status}>Ничего не найдено</div>
          )}
          {filtered.map((u) => (
            <button
              key={u.id}
              type="button"
              className={styles.item}
              onClick={() => selectUser(u)}
            >
              {u.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

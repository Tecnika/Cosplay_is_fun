import { useState, type FormEvent } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { searchUsers } from '@/features/profile/services/profileService'
import { UserPreview } from '../components/UserPreview'
import { FriendButton } from '../components/FriendButton'
import { PageShell } from '@/components/ui/PageShell'
import { EmptyState } from '@/components/ui/EmptyState'
import type { UserProfile } from '@/types'
import styles from './SocialPage.module.css'

export function FindUsersPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserProfile[]>([])
  const [searched, setSearched] = useState(false)
  const [searching, setSearching] = useState(false)

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setSearched(true)
    const res = await searchUsers(query.trim())
    setResults(res)
    setSearching(false)
  }

  return (
    <PageShell>
      <h2 className={styles.title}>Найти людей</h2>

      <form className={styles.form} onSubmit={handleSearch}>
        <label className={styles.field}>
          <span>Имя пользователя</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Введите ник..." />
        </label>
        <button className={styles.submitBtn} disabled={searching || !query.trim()}>
          {searching ? 'Поиск...' : 'Искать'}
        </button>
      </form>

      <div className={styles.list} style={{ marginTop: 'var(--spacing-lg)' }}>
        {searched && results.length === 0 && <EmptyState message="Ничего не найдено" />}

        {results.filter((p) => p.id !== user?.uid).map((p) => (
          <div key={p.id} className={styles.card}>
            <div className={styles.cardLink}>
              <UserPreview uid={p.id} size={44} />
            </div>
            <FriendButton targetUid={p.id} />
          </div>
        ))}
      </div>
    </PageShell>
  )
}

import { useState } from 'react'

export function useSaving() {
  const [saving, setSaving] = useState(false)

  async function withSaving<T>(fn: () => Promise<T>): Promise<T | undefined> {
    setSaving(true)
    try {
      return await fn()
    } finally {
      setSaving(false)
    }
  }

  return { saving, setSaving, withSaving }
}

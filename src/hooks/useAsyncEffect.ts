import { useEffect, type DependencyList } from 'react'

export function useAsyncEffect(fn: () => Promise<void>, deps: DependencyList) {
  useEffect(() => {
    let cancelled = false
    fn().catch(() => {})
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

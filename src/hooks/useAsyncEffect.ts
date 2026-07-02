import { useEffect, type DependencyList } from 'react'

export function useAsyncEffect(fn: () => Promise<void>, deps: DependencyList) {
  useEffect(() => {
    void fn().catch((err) => console.error('[useAsyncEffect]', err))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

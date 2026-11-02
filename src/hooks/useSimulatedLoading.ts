import { useEffect, useState } from 'react'

/**
 * Simulates the latency a real API would introduce so pages can render
 * genuine loading states during the demo. Runs once per mount.
 */
export function useSimulatedLoading(ms = 420): boolean {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), ms)
    return () => window.clearTimeout(id)
  }, [ms])
  return loading
}

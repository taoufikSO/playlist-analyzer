import { useState, useEffect, useCallback } from 'react'

export function useAnalyticsLimit(freeLimit = 5) {
  const [usageCount, setUsageCount] = useState(0)
  const [isLimited, setIsLimited] = useState(false)

  const monthKey = () => `playlist_usage_${new Date().toISOString().slice(0, 7)}` // YYYY-MM

  useEffect(() => {
    const key = monthKey()
    const usage = parseInt(localStorage.getItem(key) || '0', 10)
    setUsageCount(usage)
    setIsLimited(usage >= freeLimit)
  }, [freeLimit])

  const incrementUsage = useCallback(() => {
    const key = monthKey()
    const next = usageCount + 1
    setUsageCount(next)
    setIsLimited(next >= freeLimit)
    localStorage.setItem(key, String(next))
  }, [usageCount, freeLimit])

  const clearUsage = useCallback(() => {
    localStorage.removeItem(monthKey())
    setUsageCount(0)
    setIsLimited(false)
  }, [])

  const remainingAnalyses = Math.max(0, freeLimit - usageCount)

  return { usageCount, isLimited, remainingAnalyses, incrementUsage, clearUsage, freeLimit }
}

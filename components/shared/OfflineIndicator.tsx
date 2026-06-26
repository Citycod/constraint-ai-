'use client'

import { useEffect, useState } from 'react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)
    setShowIndicator(!navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setTimeout(() => setShowIndicator(false), 2000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showIndicator) return null

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
        isOnline
          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            Back Online - Changes will sync
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
            You&apos;re Offline - App is working locally
          </>
        )}
      </div>
    </div>
  )
}

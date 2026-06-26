'use client'

import { useEffect } from 'react'
import { performanceMonitor } from '@/lib/metrics'

export function PWAInitializer() {
  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.init()

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration)
        })
        .catch((error) => {
          console.log('[PWA] Service Worker registration failed:', error)
        })
    }

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Service Worker controller changed')
      })
    }

    return () => {
      // Cleanup
      performanceMonitor.destroy()
    }
  }, [])

  return null
}

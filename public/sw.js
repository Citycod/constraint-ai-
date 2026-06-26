/**
 * Service Worker
 * Enables offline functionality with cache-first strategy for API responses
 * and network-first strategy for pages
 */

const CACHE_NAME = 'edge-ai-v2'
const RUNTIME_CACHE = 'edge-ai-runtime-v2'
const API_CACHE = 'edge-ai-api-v2'

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/healthcare',
  '/education',
  '/offline.html',
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.log('[SW] Error precaching:', err)
        // Continue even if precaching fails
      })
    })
  )
  self.skipWaiting()
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE &&
              cacheName !== API_CACHE
            )
          })
          .map((cacheName) => {
            return caches.delete(cacheName)
          })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return
  }

  // API requests - cache-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response
          }

          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response && response.status === 200) {
                cache.put(request, response.clone())
              }
              return response
            })
            .catch(() => {
              // Return cached response or error response
              return (
                cache.match(request) ||
                new Response(
                  JSON.stringify({
                    error: 'Offline - No cached response available',
                  }),
                  {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' },
                  }
                )
              )
            })
        })
      })
    )
    return
  }

  // Page navigation - network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone before caching to avoid "body already used" error
          if (response && response.status === 200) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, response.clone())
            })
          }
          return response
        })
        .catch(() => {
          // Return cached page or offline page
          return (
            caches
              .match(request)
              .then((response) => {
                return response || caches.match('/offline.html')
              })
              .catch(() => {
                return new Response('Offline', { status: 503 })
              })
          )
        })
    )
    return
  }

  // Static assets - cache-first strategy
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response
          }

          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone())
            }
            return response
          })
        })
      })
    )
    return
  }

  // Everything else - network-first
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, response.clone())
          })
        }
        return response
      })
      .catch(() => {
        return (
          caches.match(request) ||
          new Response('Offline', { status: 503 })
        )
      })
  )
})

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-triage' || event.tag === 'sync-quiz') {
    event.waitUntil(syncOfflineData())
  }
})

async function syncOfflineData() {
  try {
    // This would be implemented to sync offline queue
    // For now, just log it
    console.log('[SW] Syncing offline data')
  } catch (error) {
    console.error('[SW] Sync error:', error)
  }
}

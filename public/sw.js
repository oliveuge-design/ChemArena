/**
 * ChemArena - Service Worker
 *
 * PWA Service Worker per offline support, caching strategico e installabilità
 * Features:
 * - Cache statico per risorse core (CSS, JS, immagini)
 * - Network-first per API calls
 * - Cache-first per assets statici
 * - Offline fallback pages
 * - Background sync per future features
 */

const CACHE_NAME = 'chemarena-v1.0.0'
const STATIC_CACHE = 'chemarena-static-v1'
const DYNAMIC_CACHE = 'chemarena-dynamic-v1'

// Risorse critiche da cachare immediatamente
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/game',
  '/manager',
  '/login',
  '/manifest.json',
  '/icon.svg',
  '/lab-background.svg',
  '/_next/static/css/',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js'
]

// API endpoints da cachare con strategia network-first
const API_CACHE_PATTERNS = [
  '/api/quiz-archive',
  '/api/teachers',
  '/api/classes',
  '/api/students'
]

// Offline fallback HTML
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ChemArena - Offline</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      color: white;
      text-align: center;
    }
    .container { max-width: 400px; padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    p { opacity: 0.9; margin-bottom: 1.5rem; }
    .btn {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s ease;
    }
    .btn:hover { background: rgba(255,255,255,0.3); }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 ChemArena</h1>
    <h2>Modalità Offline</h2>
    <p>Non c'è connessione internet. Alcune funzionalità potrebbero essere limitate.</p>
    <p>Riprova quando la connessione sarà disponibile.</p>
    <a href="/" class="btn">🔄 Riprova</a>
  </div>
</body>
</html>
`

// Install event: Cache risorse statiche
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker v1.0.0')

  event.waitUntil(
    Promise.all([
      // Cache statico
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS.filter(url => url))
      }).catch(err => {
        console.warn('[SW] Failed to cache some static assets:', err)
        return Promise.resolve() // Non bloccare per errori cache
      }),

      // Cache offline fallback
      caches.open(DYNAMIC_CACHE).then(cache => {
        return cache.put('/offline.html', new Response(OFFLINE_HTML, {
          headers: { 'Content-Type': 'text/html' }
        }))
      })
    ])
  )

  // Attiva immediatamente senza aspettare
  self.skipWaiting()
})

// Activate event: Pulisci cache vecchie
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker v1.0.0')

  event.waitUntil(
    Promise.all([
      // Pulisci cache obsolete
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),

      // Prendi controllo immediatamente
      self.clients.claim()
    ])
  )
})

// Fetch event: Strategie di caching intelligenti
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Ignora richieste non-HTTP
  if (!request.url.startsWith('http')) return

  // Ignora richieste Socket.io e WebSocket
  if (url.pathname.includes('socket.io') ||
      request.headers.get('upgrade') === 'websocket') {
    return
  }

  event.respondWith(handleFetch(request))
})

async function handleFetch(request) {
  const url = new URL(request.url)

  try {
    // 1. API calls: Network-first con fallback cache
    if (url.pathname.startsWith('/api/')) {
      return await networkFirstStrategy(request)
    }

    // 2. Pagine HTML: Network-first con offline fallback
    if (request.headers.get('accept')?.includes('text/html')) {
      return await htmlNetworkFirstStrategy(request)
    }

    // 3. Assets statici: Cache-first
    if (url.pathname.startsWith('/_next/') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg')) {
      return await cacheFirstStrategy(request)
    }

    // 4. Default: Network-first
    return await networkFirstStrategy(request)

  } catch (error) {
    console.error('[SW] Fetch error:', error)
    return new Response('Network Error', { status: 408 })
  }
}

// Strategia Network-first per API
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)

    // Cache solo risposte OK
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Fallback a cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Strategia Cache-first per assets statici
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.warn('[SW] Failed to fetch asset:', request.url)
    throw error
  }
}

// Strategia HTML Network-first con offline fallback
async function htmlNetworkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Prova cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fallback offline page
    return await caches.match('/offline.html')
  }
}

// Background Sync per future features
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'quiz-submission') {
    event.waitUntil(syncQuizSubmissions())
  }
})

async function syncQuizSubmissions() {
  // Future: Sincronizza quiz submissions offline
  console.log('[SW] Syncing quiz submissions...')
}

// Push notifications support per future features
self.addEventListener('push', event => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [100, 50, 100],
    data: data.url,
    actions: [
      {
        action: 'open',
        title: 'Apri ChemArena'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close()

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    )
  }
})

console.log('[SW] ChemArena Service Worker v1.0.0 loaded')
const CACHE_NAME = "nelson-gpt-v1"
const STATIC_CACHE_NAME = "nelson-gpt-static-v1"
const RUNTIME_CACHE_NAME = "nelson-gpt-runtime-v1"

// Assets to precache
const PRECACHE_ASSETS = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png", "/offline.html"]

// Install event - precache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Precaching static assets")
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => {
        console.log("[SW] Installation complete")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Precaching failed:", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== RUNTIME_CACHE_NAME && cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Activation complete")
        return self.clients.claim()
      }),
  )
})

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    // Cache-first for static assets
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME))
  } else if (isAPIRequest(request)) {
    // Network-first for API requests with fallback
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE_NAME))
  } else if (isNavigationRequest(request)) {
    // Network-first for navigation with offline fallback
    event.respondWith(navigationStrategy(request))
  } else {
    // Default: network-first with cache fallback
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE_NAME))
  }
})

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url)
  return (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/) ||
    url.pathname.startsWith("/_next/static/")
  )
}

function isAPIRequest(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith("/api/")
}

function isNavigationRequest(request) {
  return request.mode === "navigate"
}

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error("[SW] Cache-first strategy failed:", error)
    return new Response("Asset not available offline", { status: 503 })
  }
}

// Network-first strategy (for API and dynamic content)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", error.message)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline response for API requests
    if (isAPIRequest(request)) {
      return new Response(
        JSON.stringify({
          error: "You are currently offline. Please check your internet connection and try again.",
          offline: true,
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    throw error
  }
}

// Navigation strategy (for page requests)
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    console.log("[SW] Navigation failed, serving offline page:", error.message)
    const offlineResponse = await caches.match("/offline.html")
    return offlineResponse || new Response("Offline", { status: 503 })
  }
}

// Background sync for failed requests (optional enhancement)
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle background sync logic here
      console.log("[SW] Background sync triggered"),
    )
  }
})

// Push notification handling (for future enhancement)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: data.data,
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

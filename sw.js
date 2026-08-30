// ========================================
// SERVICE WORKER FOR OFFLINE FUNCTIONALITY
// ========================================

const CACHE_NAME = 'telegram-video-cache-v2';
const OFFLINE_URL = './index.html';

// ========================================
// INSTALL EVENT - CACHE ASSETS
// ========================================
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                // Cache essential static assets with relative paths
                return cache.addAll([
                    './',
                    './index.html',
                    './manifest.json'
                ]);
            })
            .then(() => {
                // Force the waiting service worker to become the active service worker
                return self.skipWaiting();
            })
    );
});

// ========================================
// ACTIVATE EVENT - CLEAN OLD CACHES
// ========================================
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Delete old caches that don't match our current cache name
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                // Take control of all pages immediately
                return self.clients.claim();
            })
    );
});

// ========================================
// FETCH EVENT - SERVE FROM CACHE OR NETWORK
// ========================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests that aren't Telegram API
    if (url.origin !== self.location.origin && !url.origin.includes('api.telegram.org')) {
        return;
    }

    // Handle Telegram API requests for video files
    if (url.origin.includes('api.telegram.org') && url.pathname.includes('/file/')) {
        event.respondWith(
            caches.open(CACHE_NAME)
                .then((cache) => {
                    // Try to get from cache first
                    return cache.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                console.log('[Service Worker] Serving video from cache:', request.url);
                                return cachedResponse;
                            }

                            // If not in cache, fetch from network and cache it
                            console.log('[Service Worker] Fetching video from network:', request.url);
                            return fetch(request)
                                .then((networkResponse) => {
                                    // Don't cache non-successful responses
                                    // Note: Telegram API returns 'cors' type responses, not 'basic'
                                    if (!networkResponse || networkResponse.status !== 200) {
                                        return networkResponse;
                                    }

                                    // Clone the response since we need to use it twice
                                    const responseToCache = networkResponse.clone();

                                    // Cache the fetched video
                                    cache.put(request, responseToCache);

                                    return networkResponse;
                                })
                                .catch((error) => {
                                    console.error('[Service Worker] Network fetch failed:', error);
                                    // Return a custom offline response or error
                                    return new Response('Video not available offline', {
                                        status: 503,
                                        statusText: 'Service Unavailable',
                                        headers: new Headers({
                                            'Content-Type': 'text/plain'
                                        })
                                    });
                                });
                        });
                })
        );
        return;
    }

    // Handle same-origin requests (HTML, CSS, JS, etc.)
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        // Serve from cache
                        return cachedResponse;
                    }

                    // Not in cache, fetch from network
                    return fetch(request)
                        .then((networkResponse) => {
                            // Don't cache non-successful responses
                            if (!networkResponse || networkResponse.status !== 200) {
                                return networkResponse;
                            }

                            // Clone the response
                            const responseToCache = networkResponse.clone();

                            // Cache the response
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseToCache);
                                });

                            return networkResponse;
                        })
                        .catch((error) => {
                            // If offline and request is for HTML, serve cached index.html
                            if (request.mode === 'navigate') {
                                console.log('[Service Worker] Offline - serving cached index.html');
                                return caches.match(OFFLINE_URL).then(cached => {
                                    if (cached) {
                                        return cached;
                                    }
                                    // If index.html is not cached, return a basic offline response
                                    return new Response('<h1>Offline - No cached content available</h1>', {
                                        status: 503,
                                        headers: new Headers({ 'Content-Type': 'text/html' })
                                    });
                                });
                            }
                            
                            console.error('[Service Worker] Fetch failed:', error);
                            throw error;
                        });
                })
        );
        return;
    }

    // For all other requests, just pass through
    event.respondWith(fetch(request));
});

// ========================================
// MESSAGE EVENT - HANDLE MESSAGES FROM CLIENT
// ========================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_VIDEO') {
        const videoUrl = event.data.url;
        caches.open(CACHE_NAME)
            .then((cache) => {
                // FORCE DIRECT PROXY - DO NOT TRY DIRECT FETCH
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(videoUrl)}`;
                console.log('Service Worker: Fetching video via proxy:', proxyUrl);
                
                return fetch(proxyUrl)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`Proxy failed with status: ${response.status}`);
                        }
                        return response.blob();
                    })
                    .then((blob) => {
                        if (blob.size === 0) {
                            throw new Error('Downloaded video blob is empty');
                        }
                        
                        // Create a new Response with the blob and proper headers
                        const cachedResponse = new Response(blob, {
                            headers: { 
                                'Content-Type': 'video/mp4',
                                'Content-Length': blob.size
                            }
                        });
                        // Cache the blob response
                        return cache.put(videoUrl, cachedResponse);
                    });
            })
            .then(() => {
                event.ports[0].postMessage({ success: true });
            })
            .catch((error) => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME)
            .then(() => {
                event.ports[0].postMessage({ success: true });
            })
            .catch((error) => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
    }
});

// ========================================
// SYNC EVENT - BACKGROUND SYNC (OPTIONAL)
// ========================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-videos') {
        event.waitUntil(
            // Implement background sync logic here if needed
            console.log('[Service Worker] Background sync triggered')
        );
    }
});

// ========================================
// PUSH EVENT - PUSH NOTIFICATIONS (OPTIONAL)
// ========================================
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        // Handle push notifications here if needed
        console.log('[Service Worker] Push received:', data);
    }
});

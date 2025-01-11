const CACHE_NAME = "penny-partner-cache-v1";
const urlsToCache = [
  "./ind.html",
  "./css/darkmode.css",
  "./css/home.css",
  "./css/style.css",
  "./css/budget.css",
  "./css/category.css",
  "./css/review.css",
  "../backend/app.js",
  "/manifest.json",
  "/images/icons/icon-192x192.png",
  "/images/icons/icon-512x512.png"
];

// Install a service worker
self.addEventListener("install", (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
       
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Update the service worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

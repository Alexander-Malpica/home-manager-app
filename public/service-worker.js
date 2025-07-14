self.addEventListener("install", () => {
  console.log("Service worker installed.");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("Service worker activated.");
});

self.addEventListener("fetch", (event) => {
  // Only cache GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.open("home-manager-cache-v1").then((cache) => {
      return fetch(event.request)
        .then((response) => {
          // Ensure response is valid before caching
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          cache.put(event.request, response.clone()); // ✅ Safe to put
          return response;
        })
        .catch(() => cache.match(event.request)); // Fallback to cache on network failure
    })
  );
});

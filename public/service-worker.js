self.addEventListener("install", () => {
  console.log("Service worker installed.");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("Service worker activated.");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((response) => {
          return caches.open("v1").then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      );
    })
  );
});

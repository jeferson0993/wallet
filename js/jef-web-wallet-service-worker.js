const STATIC_CACHE_NAME = "jef_web_wallet_v1.0.0";
const ASSETS = [
  "/",
  "/wallet/",
];

// install event
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
});

// activate event
self.addEventListener("activate", function (e) {
  console.log("Service Worker %cActivated!", "color: green");
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== STATIC_CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })
  );
});

// fetch event
self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(cacheRes => {
      return cacheRes || fetch(e.request);
    })
  );
});

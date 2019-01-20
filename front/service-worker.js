const CACHE_NAME = 'reverb-cache-v1';
const cachedUrls = ['/', '/main.jsx'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(cachedUrls))
    );
});

self.addEventListener('fetch', (event) => {
    /*event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then((response) => {
                    if (response && response.status === 200 && response.type === "basic") {
                        let responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => cache.put(event.request, responseToCache));
                    }
                    return response;
                });
            })
    );*/
});

self.addEventListener('push', function(event) {
    let data = event.data.json();
    let title = "New message from " + data.senderName;
    self.waitUntil(self.registration.showNotification(title, {
        body: data.body
    }));
});
  
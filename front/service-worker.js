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

const notifyTag = "reverb-notify";

self.addEventListener('push', async function(event) {
    event.waitUntil((async () => {
        let existingNotifications = await self.registration.getNotifications({tag: notifyTag});
        let pendingMessages = [];
        if (existingNotifications.length > 0) {
            pendingMessages = existingNotifications[0].data;
        }
        let data = event.data.json();
        pendingMessages.push(data);

        let users = pendingMessages.map(msg => msg.senderName).filter((v, i, arr) => arr.indexOf(v) === i);
        let userString;
        if (users.length === 1) {
            userString = users[0];
        } else if (users.length <= 3) {
            for (let i = 0; i < users.length - 1; i++) {
                userString += userString[i] + ", ";
            }
            userString += "and " + userString[users.length - 1];
        } else {
            for (let i = 0; i < 2; i++) {
                userString += userString[i] + ", ";
            }
            userString += `and ${users.length - 2} others`;
        }

        let title, body;
        if (pendingMessages.length === 1) {
            title = "New message from " + userString;
            body = data.body;
        } else if (pendingMessages.length <= 3) {
            title = `${pendingMessages.length} new messages from ${userString}`;
            body = pendingMessages.map(msg => msg.senderName + ": " + msg.body).join("\n");
        } else {
            title = `${pendingMessages.length} new messages from ${userString}`;
            body = pendingMessages.slice(0, 2).map(msg => msg.senderName + ": " + msg.body).join("\n") + `\nand ${pendingMessages.length - 2} more...`;
        }

        await self.registration.showNotification(title, {
            body: body,
            data: pendingMessages,
            tag: notifyTag
        });
    })());
});
  
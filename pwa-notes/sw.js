const CACHE_NAME = 'notes-pwa-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-32.png',
    '/icons/icon-16.png',
    '/icons/icon-512.png'
];

// Устанавливаем Service Worker и кэшируем основные ресурсы
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Кэширование ресурсов...');
            // Загрузка ресурсов по одному для предотвращения ошибок
            return Promise.all(ASSETS.map(url => {
                return fetch(url).then(response => {
                    if (response.ok) {
                        console.log(`Кэширование: ${url}`);
                        return cache.put(url, response);
                    } else {
                        console.error(`Ошибка при загрузке ресурса: ${url}`);
                    }
                }).catch(error => {
                    console.error(`Ошибка при загрузке ресурса: ${url}`, error);
                });
            }));
        })
    );
});

// Активируем Service Worker и удаляем старые кэши
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            );
        })
    );
});

// Обрабатываем запросы и отдаем данные из кэша, если они есть, или запрашиваем с сети
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Если запрос найден в кэше, возвращаем его
            if (cachedResponse) {
                return cachedResponse;
            }

            // Если ресурса нет в кэше, делаем запрос в сеть
            return fetch(event.request).then(response => {
                // Если запрос успешный и это базовый ответ, кэшируем его
                if (response && response.status === 200 && response.type === 'basic') {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, response.clone());
                    });
                }
                return response;
            }).catch(error => {
                console.error('Ошибка при загрузке с сети:', error);
                // В случае ошибки (например, если нет интернета), можно вернуть оффлайн-страницу
                return caches.match('/offline.html'); // Не забудьте добавить оффлайн-страницу в ASSETS
            });
        })
    );
});

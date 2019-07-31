const cacheName = 'loanCalc-v1';

// Install Event
self.addEventListener('install', e => {
	// console.log('Service Worker: Installed');
	e.waitUntil(
		caches
			.open(cacheName)
			.then(cache => {
				// console.log('Service Worker: Caching Files');
				cache.addAll(serviceWorkerOption.assets);
			})
			.then(() => self.skipWaiting()),
	);
});

// Activate Event
self.addEventListener('activate', e => {
	// console.log('Service Worker: Activated');
	e.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cache => {
					if (cache !== cacheName) {
						console.log('Service Worker: Clearing Old Cache');
						return caches.delete(cache);
					}
				}),
			);
		}),
	);
});

// Call Fetch Event
self.addEventListener('fetch', e => {
	// console.log('Service Worker: Fetching');
	e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

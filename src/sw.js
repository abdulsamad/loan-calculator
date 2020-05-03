importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

if (workbox) {
	self.skipWaiting();

	workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

	workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com/, new StaleWhileRevalidate());

	workbox.routing.registerRoute(/\.(?:js|css)$/, new StaleWhileRevalidate());
}

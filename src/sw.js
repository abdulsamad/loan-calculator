importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

if (workbox) {
	workbox.setConfig({ modulePathPrefix: 'workbox-v5.1.2' });

	self.skipWaiting();

	workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com/, new StaleWhileRevalidate());

	workbox.routing.registerRoute(/\.(?:js|css)$/, new StaleWhileRevalidate());

	workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
}

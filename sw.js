const CACHE_NAME = 'rozay-noc-v3';
const assets = [
  './',
  './login.html',
  './dashboard.html',
  './dash-style.css',
  './dash-script.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
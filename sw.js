// オフラインでも使えるように、アプリのファイルを端末にキャッシュする（学習データは送信しない）
const CACHE = 'manabi-v14';
const FILES = ['./', './index.html', './css/style.css', './js/skills.js', './js/skills-e6.js', './js/skills-j2e.js', './js/skills-j2j.js', './js/skills-j2s.js', './js/skills-j2h.js', './js/app.js', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
// 同じアドレス上の他のアプリのキャッシュは消さない（自分の古い版だけ消す）
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('manabi-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// ネットにつながるときは最新版、つながらないときはキャッシュを使う
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});

const V = 'succes-v13';   // changez ce numéro à chaque mise à jour de l'application pour forcer le rafraîchissement
const SHELL = ['./', './index.html', './anniversaires.html', './certificats.html', './communiques.html', './simulateurs.html', './recrutement.html', './pointage.html', './pointer.html', './verification.html', './sync.html', './config.js', './manifest.webmanifest', './icon-192.png', './dev.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
const store = (r, res) => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; };
const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (/script\.google(usercontent)?\.com/.test(r.url)) return;   // API Google : toujours en direct
  const isPage = r.mode === 'navigate' || /\.(html|js)$/.test(new URL(r.url).pathname) || new URL(r.url).pathname.endsWith('/');
  if (isPage) {
    // Pages : réseau d'abord (nouvelle version immédiate), cache si hors ligne ou connexion trop lente (4 s)
    e.respondWith(Promise.race([fetch(r), timeout(4000)]).then(res => store(r, res))
      .catch(() => caches.match(r, {ignoreSearch: true}).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  // Images, polices, bibliothèques : cache d'abord, mise à jour en arrière-plan
  e.respondWith(caches.match(r, {ignoreSearch: true}).then(hit => {
    const net = fetch(r).then(res => store(r, res)).catch(() => hit);
    return hit || net;
  }));
});
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type: 'window', includeUncontrolled: true}).then(l => l.length ? l[0].focus() : clients.openWindow('./')));
});

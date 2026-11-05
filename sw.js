const V = 'succes-v8';   // changez ce numéro à chaque mise à jour pour forcer le rafraîchissement
const SHELL = ['./', './index.html', './anniversaires.html', './certificats.html', './communiques.html', './simulateurs.html', './verification.html', './sync.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
// Cache d'abord, puis mise à jour en arrière-plan (fonctionne hors ligne, polices et html2canvas inclus)
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (/script\.google(usercontent)?\.com/.test(r.url)) return;   // API Google : toujours en direct
  e.respondWith(caches.match(r, {ignoreSearch: true}).then(hit => {
    const net = fetch(r).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => hit || (r.mode === 'navigate' ? caches.match('./index.html') : undefined));
    return hit || net;
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type: 'window', includeUncontrolled: true}).then(l => l.length ? l[0].focus() : clients.openWindow('./')));
});

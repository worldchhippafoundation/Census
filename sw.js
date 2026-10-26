/* World Chhippa Foundation - offline page cache (v1)
   Lets the portal page reopen without internet after it has been opened once online.
   Firebase / Firestore traffic is never touched, so data sync works exactly as before. */
var CACHE = 'wcf-shell-v1';

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(['./', 'index.html']).catch(function () {}); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  /* never intercept Firebase / Google API calls or the admin page */
  if (/firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com|firebaseinstallations\.googleapis\.com/.test(url.hostname)) return;
  if (url.pathname.slice(-10) === 'admin.html') return;

  if (req.mode === 'navigate') {
    /* page: always try the network first (so updates reach people), fall back to the saved copy */

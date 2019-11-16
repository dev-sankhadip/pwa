const staticCacheName = 'site-static-v2';
const dynamicCache='site-dynamic-v1';
const urls = [
  '/',
  '/index.html',
  '/js/app.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  '/css/styles.css',
  '/css/materialize.min.css',
  '/img/dish.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
  '/pages/fallback.html'
];


// install service worker
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName)
    .then(cache => {
      console.log('caching shell assets');
      for(const url of urls)
      {
        cache.add(url);
      }
    })
  );
});

// activate event
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys()
    .then((keys)=>
    {
      return Promise.all(keys
        .filter(key=>key!==staticCacheName && key!==dynamicCache)
        .map(key=>caches.delete(key))
        );
    })
  )
});

//cache site limit function
const limitCacheSize=(name, size)=>
{
  caches.open(name)
  .then((cache)=>
  {
    cache.keys()
    .then((keys)=>
    {
      if(keys.length>size)
      {
        cache.delete(keys[0])
        .then(limitCacheSize(name, size))
      }
    })
  })
}


// fetch event
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request)
    .then((cacheRes)=>
    {
      return cacheRes || fetch(evt.request)
      .then((fetchRes)=>
      {//
        return caches.open(dynamicCache).then(cache=>
          {
            cache.put(evt.request.url, fetchRes.clone());
            limitCacheSize(dynamicCache, 2);
            return fetchRes;
          })
      })
      .catch(()=>
      {
        console.log('error');
        caches.match('/page/fallback.html')
      })
    })
  )
});
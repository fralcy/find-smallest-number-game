if(!self.define){let e,s={};const n=(n,i)=>(n=new URL(n+".js",i).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(i,c)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(s[r])return;let o={};const d=e=>n(e,r),a={module:{uri:r},exports:o,require:d};s[r]=Promise.all(i.map((e=>a[e]||d(e)))).then((e=>(c(...e),o)))}}define(["./workbox-fa1f7b7e"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index-BCaYpAdb.js",revision:null},{url:"assets/index-BsVbI-U3.css",revision:null},{url:"game-icon.svg",revision:"a57e4e62420c14ba8a8ba1fb16f5c6cc"},{url:"index.html",revision:"834458d51e0a18ee33ed68a3decf5622"},{url:"pwa-192x192.png",revision:"49c585e3abef1f9d0bd273df0a6d260d"},{url:"pwa-512x512.png",revision:"0cad3ffb58536918cd111f0267cd236b"},{url:"registerSW.js",revision:"24f65982940424083a8e7c8dc24c53d7"},{url:"screenshot-narrow.png",revision:"5da23d6422da275220ac1d8dbc7680e8"},{url:"screenshot-wide.png",revision:"9e7d413c134664d4cfb54fbb8d4697d1"},{url:"game-icon.svg",revision:"a57e4e62420c14ba8a8ba1fb16f5c6cc"},{url:"pwa-192x192.png",revision:"49c585e3abef1f9d0bd273df0a6d260d"},{url:"pwa-512x512.png",revision:"0cad3ffb58536918cd111f0267cd236b"},{url:"manifest.webmanifest",revision:"3e73c006f99c71114cf3dc51e5056fa1"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"))),e.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-cache",plugins:[new e.ExpirationPlugin({maxEntries:10,maxAgeSeconds:31536e3}),new e.CacheableResponsePlugin({statuses:[0,200]})]}),"GET"),e.registerRoute(/^https:\/\/username\.github\.io\/find-smallest-number-game\//,new e.StaleWhileRevalidate({cacheName:"app-content",plugins:[]}),"GET")}));

const CACHE = 'maestro-v0.0.2';
/*const ASSETS = [
  './', 
  './index.html', 
  './components.html', 
  './assets/style.css', 
  './manifest.json',
  './posters/favicon.png',
  './posters/maskable-icon.png',
  './posters/monochrome-icon.png',
  './posters/maestro-front-face.png',
  './posters/maestro-product.png',
  './posters/maestro-top-face.png',
  './posters/phone.png',
  './posters/widgets/CalendarDay.png',
  './posters/widgets/CalendarMonth.png',
  './posters/widgets/ClockHorizontal.png',
  './posters/widgets/ClockVertical.png',
  './posters/widgets/MoonFace.png',
  './posters/widgets/SunCycle.png',
  './posters/widgets/Weather.png',
  './icons/arrow_back_ios_new.svg',
  './icons/auto.svg',
  './icons/brush.svg',
  './icons/console.svg',
  './icons/dark_mode.svg',
  './icons/extension_off.svg',
  './icons/history.svg',
  './icons/language.svg',
  './icons/light_mode.svg',
  './icons/maestro.svg',
  './icons/mic.svg',
  './icons/profil.svg',
  './icons/record_voice_over.svg',
  './icons/screen.svg',
  './icons/settings.svg',
  './icons/touch.svg',
  './icons/female1.svg',
  './icons/female2.svg',
  './icons/female3.svg',
  './icons/male1.svg',
  './icons/male2.svg',
  './icons/male3.svg',
  './icons/sentiment_calm.svg',
  './icons/sentiment_dissatisfied.svg',
  './icons/sentiment_excited.svg',
  './icons/sentiment_neutral.svg',
  './icons/sentiment_sad.svg',
  './icons/sentiment_stressed.svg',
  './icons/sentiment_very_satisfied.svg'
];
*/
// install
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));

// fetch
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(res => res || fetch(e.request))));

navigator.serviceWorker.register('/MaestroConnect/sw.js');
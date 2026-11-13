// ============================================================
// install.js — "Install App" button in the header + service
// worker registration so the app works offline.
// ============================================================

let deferredPrompt = null;

const $id = (id) => document.getElementById(id);
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;
const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function showInstall(show) {
  const box = $id('install-container');
  if (box) box.style.display = show ? 'block' : 'none';
}

function say(msg, ms) {
  if (typeof toast === 'function') toast(msg, ms);
  else alert(msg);
}

// Chrome / Edge / Android: browser says the app is installable
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (!isStandalone()) showInstall(true);
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  showInstall(false);
});

window.addEventListener('DOMContentLoaded', () => {
  const btn = $id('install-btn');

  if (btn) {
    btn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        showInstall(false);
      } else if (isIOS()) {
        say('Tap the Share button, then "Add to Home Screen"', 7000);
      } else {
        say('Open the browser menu (⋮) and tap "Install app" or "Add to Home screen". The page must be opened over https.', 8000);
      }
    });
  }

  // Always show the button unless the app is already installed. If the
  // browser has no install prompt (iOS, or not yet eligible) the button
  // explains the manual steps instead.
  showInstall(!isStandalone());
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  });
}

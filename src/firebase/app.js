import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';

let cachedApp = null;

function loadConfig() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase config is only available in the browser');
  }

  if (window.__FIREBASE_CONFIG__) {
    return window.__FIREBASE_CONFIG__;
  }

  if (window.firebaseConfig) {
    return window.firebaseConfig;
  }

  throw new Error(
    'Firebase configuration is missing. Expose window.__FIREBASE_CONFIG__ before loading src/main.js or provide a global window.firebaseConfig object.'
  );
}

export function getFirebaseApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const config = loadConfig();

  if (!config || typeof config !== 'object') {
    throw new Error('Firebase configuration must be an object.');
  }

  if (getApps().length) {
    cachedApp = getApps()[0];
    return cachedApp;
  }

  cachedApp = initializeApp(config);
  return cachedApp;
}

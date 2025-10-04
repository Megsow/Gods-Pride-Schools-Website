// Firebase initialization for the God's Pride Schools website.
// The configuration object is provided by the bundled `firebase-config.js`
// script, which assigns the credentials to `window.__FIREBASE_CONFIG__`.

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const injectedConfig = window.__FIREBASE_CONFIG__;

let firebaseApp = null;
let auth = null;
let firestore = null;
let storage = null;

if (injectedConfig && injectedConfig.apiKey) {
  firebaseApp = getApps().length ? getApps()[0] : initializeApp(injectedConfig);
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
} else {
  console.warn(
    "Firebase configuration not found. Define window.__FIREBASE_CONFIG__ in firebase-config.js."
  );
}

export { firebaseApp, auth, firestore, storage };
export const hasFirebaseConfig = Boolean(firebaseApp);

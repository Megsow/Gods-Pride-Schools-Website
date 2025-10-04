// Firebase initialization for the God's Pride Schools website.
// The configuration object is provided by the bundled `firebase-config.js`
// script, which assigns the credentials to `window.__FIREBASE_CONFIG__`.

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const injectedConfig = window.__FIREBASE_CONFIG__;

let firebaseApp = null;
let auth = null;
let firestore = null;
let storage = null;
let googleProvider = null;

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

function ensureAuth() {
  if (!auth) {
    throw new Error(
      "Firebase Auth is not initialized. Ensure firebase-config.js sets window.__FIREBASE_CONFIG__ before loading admin scripts."
    );
  }
  return auth;
}

function ensureFirestore() {
  if (!firestore) {
    throw new Error(
      "Firestore is not initialized. Ensure firebase-config.js sets window.__FIREBASE_CONFIG__ before loading admin scripts."
    );
  }
  return firestore;
}

function getGoogleProvider() {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters?.({ prompt: "select_account" });
  }
  return googleProvider;
}

export function watchAuthState(callback) {
  if (!auth) {
    console.warn(
      "Auth watcher requested before Firebase initialised. Returning no-op listener."
    );
    callback?.(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function signInWithEmail(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required to sign in.");
  }
  return signInWithEmailAndPassword(ensureAuth(), email, password);
}

export function signInWithGoogle() {
  return signInWithPopup(ensureAuth(), getGoogleProvider());
}

export function signOutUser() {
  return signOut(ensureAuth());
}

export function subscribeToCollection(collectionName, callback, options = {}) {
  if (!collectionName) {
    throw new Error("Collection name is required.");
  }
  const db = ensureFirestore();
  const { orderByField, orderDirection = "asc" } = options;

  let collectionRef = collection(db, collectionName);
  if (orderByField) {
    collectionRef = query(collectionRef, orderBy(orderByField, orderDirection));
  }

  return onSnapshot(collectionRef, (snapshot) => {
    const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    callback(items);
  });
}

export async function saveDocument(collectionName, data) {
  if (!collectionName) {
    throw new Error("Collection name is required.");
  }
  if (!data || typeof data !== "object") {
    throw new Error("Data must be an object.");
  }

  const db = ensureFirestore();
  const { id, ...rest } = data;
  const timestamp = serverTimestamp();

  if (id) {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, { ...rest, updatedAt: timestamp }, { merge: true });
    return { id };
  }

  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, { ...rest, createdAt: timestamp, updatedAt: timestamp });
  return { id: docRef.id };
}

export function deleteDocument(collectionName, id) {
  if (!collectionName || !id) {
    throw new Error("Both collection name and document ID are required to delete a document.");
  }
  const db = ensureFirestore();
  const docRef = doc(db, collectionName, id);
  return deleteDoc(docRef);
}


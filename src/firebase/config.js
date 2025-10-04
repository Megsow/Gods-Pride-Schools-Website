// Firebase initialization for the God's Pride Schools website.
// The configuration object is provided by the bundled `firebase-config.js`
// script, which assigns the credentials to `window.__FIREBASE_CONFIG__`.

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
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
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
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

function getPathSegments(path) {
  if (!path || typeof path !== "string") {
    throw new Error("A valid Firestore path is required.");
  }
  return path.split("/").map((segment) => segment.trim()).filter(Boolean);
}

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

export function signOutUser() {
  return signOut(ensureAuth());
}

export function subscribeToCollection(collectionName, callback, options = {}) {
  if (!collectionName) {
    throw new Error("Collection name is required.");
  }
  const db = ensureFirestore();
  const segments = getPathSegments(collectionName);
  if (!segments.length) {
    throw new Error("Collection path cannot be empty.");
  }

  const { orderByField, orderDirection = "asc", orderBy: orderByArgs, limit: limitValue } = options;

  let collectionRef = collection(db, ...segments);
  const constraints = [];

  const normalisedOrderBy = Array.isArray(orderByArgs) ? orderByArgs : [];
  normalisedOrderBy.forEach((entry) => {
    if (!entry) return;
    if (Array.isArray(entry)) {
      const [field, direction = "asc"] = entry;
      constraints.push(orderBy(field, direction));
      return;
    }
    if (typeof entry === "object" && entry.field) {
      constraints.push(orderBy(entry.field, entry.direction || "asc"));
    }
  });

  if (orderByField) {
    constraints.push(orderBy(orderByField, orderDirection));
  }

  if (limitValue) {
    constraints.push(limit(limitValue));
  }

  if (constraints.length) {
    collectionRef = query(collectionRef, ...constraints);
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
  const segments = getPathSegments(collectionName);
  if (!segments.length) {
    throw new Error("Collection path cannot be empty.");
  }
  const { id, ...rest } = data;
  const timestamp = serverTimestamp();

  if (id) {
    const docRef = doc(db, ...segments, id);
    await setDoc(docRef, { ...rest, updatedAt: timestamp }, { merge: true });
    return { id };
  }

  const colRef = collection(db, ...segments);
  const docRef = await addDoc(colRef, { ...rest, createdAt: timestamp, updatedAt: timestamp });
  return { id: docRef.id };
}

export function deleteDocument(collectionName, id) {
  if (!collectionName || !id) {
    throw new Error("Both collection name and document ID are required to delete a document.");
  }
  const db = ensureFirestore();
  const segments = getPathSegments(collectionName);
  if (!segments.length) {
    throw new Error("Collection path cannot be empty.");
  }
  const docRef = doc(db, ...segments, id);
  return deleteDoc(docRef);
}

export function subscribeToDocument(path, callback) {
  if (!path) {
    throw new Error("Document path is required.");
  }
  const db = ensureFirestore();
  const segments = getPathSegments(path);
  if (segments.length < 2 || segments.length % 2 !== 0) {
    throw new Error(`Invalid document path: ${path}`);
  }
  const docRef = doc(db, ...segments);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  });
}


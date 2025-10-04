const firebaseConfig = window.__FIREBASE_CONFIG__ || {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.warn(
    "Firebase config is using placeholder values. Provide real credentials via window.__FIREBASE_CONFIG__."
  );
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });

export { auth, db };

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithEmail(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const credentials = await signInWithEmailAndPassword(auth, email, password);
  return credentials.user;
}

export async function signInWithGoogle() {
  const credentials = await signInWithPopup(auth, googleProvider);
  return credentials.user;
}

export function signOutUser() {
  return signOut(auth);
}

export function subscribeToCollection(collectionName, callback) {
  if (!collectionName) {
    throw new Error("Collection name is required");
  }
  const collectionRef = collection(db, collectionName);
  return onSnapshot(collectionRef, (snapshot) => {
    const items = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    }));
    callback(items);
  });
}

export async function saveDocument(collectionName, payload) {
  if (!collectionName) {
    throw new Error("Collection name is required");
  }
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload must be an object");
  }
  const { id, ...data } = payload;
  if (id) {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, data, { merge: true });
    return id;
  }
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
}

export async function deleteDocument(collectionName, documentId) {
  if (!collectionName || !documentId) {
    throw new Error("Collection name and document id are required");
  }
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
}

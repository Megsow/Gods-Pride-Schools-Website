import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getFirebaseApp } from './app.js';

let cachedDb = null;

export function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  const app = getFirebaseApp();
  cachedDb = getFirestore(app);
  return cachedDb;
}

export {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
};

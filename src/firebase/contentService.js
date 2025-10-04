import { firestore, storage } from "./config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getDownloadURL, ref } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

function assertFirestore() {
  if (!firestore) {
    throw new Error(
      "Firestore is not initialized. Ensure firebase-config.js defines window.__FIREBASE_CONFIG__."
    );
  }
}

function assertStorage() {
  if (!storage) {
    throw new Error(
      "Firebase Storage is not initialized. Ensure firebase-config.js defines window.__FIREBASE_CONFIG__."
    );
  }
}

function buildDocRef(path) {
  if (!path) {
    throw new Error("A valid document path is required.");
  }

  const segments = path.split("/").filter(Boolean);
  if (segments.length < 2 || segments.length % 2 !== 0) {
    throw new Error(`Invalid document path: ${path}`);
  }

  assertFirestore();
  return doc(firestore, ...segments);
}

function buildCollectionRef(path) {
  if (!path) {
    throw new Error("A valid collection path is required.");
  }

  const segments = path.split("/").filter(Boolean);
  assertFirestore();
  return collection(firestore, ...segments);
}

export async function fetchDocument(path) {
  const docRef = buildDocRef(path);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    throw new Error(`Document not found at path: ${path}`);
  }

  return { id: snapshot.id, ...snapshot.data() };
}

export async function fetchCollection(path, options = {}) {
  const { orderByField, orderDirection = "asc" } = options;
  let colRef = buildCollectionRef(path);

  if (orderByField) {
    colRef = query(colRef, orderBy(orderByField, orderDirection));
  }

  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function resolveImage(storagePath) {
  if (!storagePath) {
    throw new Error("A storage path is required to resolve an image.");
  }

  assertStorage();
  const imageRef = ref(storage, storagePath);
  return getDownloadURL(imageRef);
}

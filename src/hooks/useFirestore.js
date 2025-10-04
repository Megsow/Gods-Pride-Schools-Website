import {
  getDb,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from '../firebase/firestore.js';

const DEFAULT_TTL = 5 * 60 * 1000;

const documentCache = new Map();
const collectionCache = new Map();

function createCacheKey(path, options = {}) {
  return `${path}|${JSON.stringify(options)}`;
}

function getDocSegments(path) {
  const segments = path.split('/').map(segment => segment.trim()).filter(Boolean);
  if (segments.length < 2 || segments.length % 2 !== 0) {
    throw new Error(`Invalid document path: ${path}`);
  }
  return segments;
}

function getCollectionSegments(path) {
  const segments = path.split('/').map(segment => segment.trim()).filter(Boolean);
  if (segments.length === 0) {
    throw new Error(`Invalid collection path: ${path}`);
  }
  return segments;
}

function normaliseOrderBy(order) {
  if (!order) {
    return [];
  }
  if (Array.isArray(order) && typeof order[0] === 'string') {
    return [order];
  }
  if (Array.isArray(order)) {
    return order;
  }
  throw new Error('orderBy must be an array.');
}

async function runQuery(path, options = {}) {
  const db = getDb();
  const segments = getCollectionSegments(path);
  let ref = collection(db, ...segments);
  const constraints = [];

  normaliseOrderBy(options.orderBy).forEach(([field, direction]) => {
    constraints.push(orderBy(field, direction));
  });

  if (options.limit) {
    constraints.push(limit(options.limit));
  }

  if (constraints.length) {
    ref = query(ref, ...constraints);
  }

  const snapshot = await getDocs(ref);
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function useDocument(path, { ttl = DEFAULT_TTL, fallback = null } = {}) {
  const cached = documentCache.get(path);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return { data: cached.data, fromCache: true, error: null };
  }

  try {
    const db = getDb();
    const segments = getDocSegments(path);
    const ref = doc(db, ...segments);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      throw new Error(`Document not found at ${path}`);
    }
    const data = snapshot.data();
    documentCache.set(path, { data, timestamp: Date.now() });
    return { data, fromCache: false, error: null };
  } catch (error) {
    if (fallback !== null && fallback !== undefined) {
      return { data: fallback, fromCache: false, error };
    }
    return { data: null, fromCache: false, error };
  }
}

export async function useCollection(path, { ttl = DEFAULT_TTL, fallback = [] , orderBy: order, limit: limitValue } = {}) {
  const cacheKey = createCacheKey(path, { order, limit: limitValue });
  const cached = collectionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return { data: cached.data, fromCache: true, error: null };
  }

  try {
    const data = await runQuery(path, { orderBy: order, limit: limitValue });
    collectionCache.set(cacheKey, { data, timestamp: Date.now() });
    return { data, fromCache: false, error: null };
  } catch (error) {
    if (fallback) {
      return { data: fallback, fromCache: false, error };
    }
    return { data: [], fromCache: false, error };
  }
}

export function subscribeDocument(path, callback) {
  try {
    const db = getDb();
    const segments = getDocSegments(path);
    const ref = doc(db, ...segments);
    return onSnapshot(ref, snapshot => {
      callback(snapshot.exists() ? snapshot.data() : null);
    });
  } catch (error) {
    console.warn(`subscribeDocument failed for ${path}:`, error);
    callback(null, error);
    return () => {};
  }
}

export function subscribeCollection(path, callback, options = {}) {
  try {
    const db = getDb();
    const segments = getCollectionSegments(path);
    let ref = collection(db, ...segments);
    const constraints = [];
    normaliseOrderBy(options.orderBy).forEach(([field, direction]) => {
      constraints.push(orderBy(field, direction));
    });
    if (options.limit) {
      constraints.push(limit(options.limit));
    }
    if (constraints.length) {
      ref = query(ref, ...constraints);
    }
    return onSnapshot(ref, snapshot => {
      callback(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })), null);
    });
  } catch (error) {
    console.warn(`subscribeCollection failed for ${path}:`, error);
    callback([], error);
    return () => {};
  }
}

export function clearFirestoreCache() {
  documentCache.clear();
  collectionCache.clear();
}

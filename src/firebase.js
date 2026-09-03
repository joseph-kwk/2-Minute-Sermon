// Firebase Firestore Helper Module
// Modular Firebase v10 SDK integration with automatic fallback support

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCcgvBZ-xPO_84F1Xf1a7yzro1zvw42F-8',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'minute-sermon-d8e16.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || 'minute-sermon-d8e16',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'minute-sermon-d8e16.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1038526641606',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || '1:1038526641606:web:64178acc20c4cc756f6ec7'
};

let app = null;
let db = null;

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    db  = getFirestore(app);
    console.log('🔥 Firebase Firestore initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Firebase initialization warning:', err.message);
  }
}

/** Subscribe to real-time changes in a Firestore collection */
export function subscribeCollection(collectionName, onDataChanged) {
  if (!db) return () => {};
  const colRef = collection(db, collectionName);
  const q = query(colRef);
  
  return onSnapshot(q, (snapshot) => {
    const items = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() });
    });
    onDataChanged(items);
  }, (err) => {
    console.warn(`Firestore snapshot error for ${collectionName}:`, err);
  });
}

/** Fetch all documents from a collection */
export async function fetchCollection(collectionName) {
  if (!db) return null;
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const items = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() });
    });
    return items;
  } catch (err) {
    console.warn(`Firestore fetch failed for ${collectionName}:`, err);
    return null;
  }
}

/** Upsert (create or update) a single document */
export async function saveDocument(collectionName, docId, data) {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, String(docId));
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (err) {
    console.warn(`Firestore save failed for ${collectionName}/${docId}:`, err);
    return false;
  }
}

/** Delete a single document */
export async function deleteDocument(collectionName, docId) {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn(`Firestore delete failed for ${collectionName}/${docId}:`, err);
    return false;
  }
}

/** Seed a collection if it is currently empty in Firestore */
export async function seedCollectionIfEmpty(collectionName, seedArray) {
  if (!db) return;
  try {
    const existing = await fetchCollection(collectionName);
    if (existing && existing.length === 0 && seedArray && seedArray.length > 0) {
      console.log(`🌱 Seeding Firestore collection '${collectionName}'...`);
      for (const item of seedArray) {
        if (item.id) {
          await saveDocument(collectionName, item.id, item);
        }
      }
    }
  } catch (err) {
    console.warn(`Firestore seed error for ${collectionName}:`, err);
  }
}

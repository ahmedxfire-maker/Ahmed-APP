import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use specified firestoreDatabaseId or default
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);

// Auto authenticate anonymously to support seamless multi-device operations
signInAnonymously(auth).catch((err) => {
  // Non-blocking warning in case anonymous auth is optional or offline
  console.warn('Firebase anonymous auth note:', err?.message || err);
});

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'pests', 'test-connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration or internet connection.');
    }
  }
}
testConnection();

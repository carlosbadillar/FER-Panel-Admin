import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;

const missing = REQUIRED_KEYS.filter((key) => !firebaseConfig[key]?.trim());

if (missing.length > 0) {
  throw new Error(
    `[FER Conecta] Faltan variables de entorno de Firebase: ${missing.join(', ')}. ` +
      'Revisa tu archivo .env.local.'
  );
}

const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export default firebaseApp;
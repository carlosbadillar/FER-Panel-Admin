import { getApp, getApps, initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

function buildConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim();

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  const storageBucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();

  const messagingSenderId =
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim();

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    ...(storageBucket ? { storageBucket } : {}),
    ...(messagingSenderId ? { messagingSenderId } : {}),
  };
}

const firebaseConfig = buildConfig();

export let firebaseApp: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;
export let isFirebaseConfigured = false;

if (firebaseConfig) {
  try {
    firebaseApp = getApps().length > 0
      ? getApp()
      : initializeApp(firebaseConfig);

    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);

    isFirebaseConfigured = true;

    console.info('[FER Conecta] Firebase conectado correctamente.');
  } catch (error) {
    console.error('[FER Conecta] Error al inicializar Firebase:', error);
  }
} else {
  console.warn(
    '[FER Conecta] Firebase sin configurar. Revisa las variables de entorno.'
  );
}

export default firebaseApp;
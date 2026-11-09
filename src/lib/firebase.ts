import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

/**
 * Valores del ejemplo `.env.local.example`. Si se copian tal cual,
 * no deben intentar abrir una app de Firebase.
 */
const PLACEHOLDERS = new Set([
  'your_api_key',
  'your_project.firebaseapp.com',
  'your_project_id',
  'your_project.appspot.com',
  'your_sender_id',
  'your_app_id',
]);

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  if (!value) return undefined;
  if (PLACEHOLDERS.has(value) || value.startsWith('your_')) return undefined;
  return value;
}

function buildConfig() {
  const apiKey = readEnv('NEXT_PUBLIC_FIREBASE_API_KEY');
  const authDomain = readEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  const projectId = readEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  const appId = readEnv('NEXT_PUBLIC_FIREBASE_APP_ID');

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  const storageBucket = readEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  const messagingSenderId = readEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');

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
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    isFirebaseConfigured = true;
  } catch (error) {
    firebaseApp = null;
    auth = null;
    db = null;
    isFirebaseConfigured = false;
    console.warn(
      '[FER Conecta] Firebase no se pudo inicializar. El panel sigue disponible con Acceso Demo.',
      error
    );
  }
} else if (process.env.NODE_ENV !== 'production') {
  console.info(
    '[FER Conecta] Firebase sin configurar (variables ausentes o de ejemplo). Usa Acceso Demo Inmediato.'
  );
}

export default firebaseApp;

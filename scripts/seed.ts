/**
 * Carga las tres campañas del prototipo en `announcements`.
 *
 * Requisitos:
 *   1. `.env.local` con las claves NEXT_PUBLIC_FIREBASE_* reales.
 *   2. Un usuario administrador ya creado en Firebase Authentication.
 *   3. SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD de ese usuario.
 *   4. Reglas desplegadas que permitan escritura a ese correo,
 *      o reglas abiertas solo durante la carga inicial.
 *
 * Uso: npm run seed
 */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { announcementPayload, MOCK_ANNOUNCEMENTS } from '../src/data/announcements';

function loadEnvFile(filename: string) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;

  const text = readFileSync(path, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value || value.startsWith('your_')) {
    throw new Error(`Falta ${name}. Defínela en .env.local antes de sembrar.`);
  }
  return value;
}

async function main() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const app = initializeApp({
    apiKey: requireEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: requireEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    appId: requireEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
  });

  const auth = getAuth(app);
  const db = getFirestore(app);

  const email = requireEnv('SEED_ADMIN_EMAIL');
  const password = requireEnv('SEED_ADMIN_PASSWORD');

  await signInWithEmailAndPassword(auth, email, password);

  for (const item of MOCK_ANNOUNCEMENTS) {
    await setDoc(doc(db, 'announcements', item.id), announcementPayload(item), {
      merge: true,
    });
    console.log(`✓ ${item.title}`);
  }

  console.log(`Listo: ${MOCK_ANNOUNCEMENTS.length} anuncios en la colección "announcements".`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`No se pudo sembrar Firestore: ${message}`);
  process.exit(1);
});

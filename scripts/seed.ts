/**
 * Carga anuncios de ejemplo en la colección `anuncios` (modelo Anuncio de src/types).
 *
 * Requisitos:
 *   1. `.env.local` con las claves NEXT_PUBLIC_FIREBASE_* reales.
 *   2. Un usuario administrador (email/contraseña) creado en Firebase Authentication.
 *   3. SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD de ese usuario en `.env.local`.
 *   4. firestore.rules desplegadas (firebase deploy --only firestore).
 *
 * Uso: npm run seed
 * Es idempotente: usa IDs fijos (seed-1, seed-2…), así que correrlo dos veces no duplica.
 */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';

function loadEnvFile(filename: string) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
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

const DIA = 24 * 60 * 60 * 1000;
const haceDias = (n: number) => Timestamp.fromDate(new Date(Date.now() - n * DIA));

const ANUNCIOS = [
  {
    id: 'seed-1',
    titulo: 'Renovación Beca Preparatoria',
    resumen: 'Recordatorio de entrega de documentación semestral.',
    descripcion:
      'Becarios de preparatoria: la fecha límite para entregar boleta y constancia de estudios es el 30 de noviembre. Sube tus documentos en el portal o entrégalos en oficinas.',
    tags: ['renovación', 'prepa'],
    isFeatured: true,
    audiencias: ['becarios'],
    prioridad: 'urgente',
    estado: 'publicado',
    dias: 3,
    likes: 42,
  },
  {
    id: 'seed-2',
    titulo: 'Convocatoria CETYS',
    resumen: 'Apertura de registro para la beca de excelencia académica.',
    descripcion:
      'Abrimos el registro para aspirantes a la beca de excelencia académica en CETYS Universidad. Revisa requisitos y fechas en la sección de convocatorias.',
    tags: ['convocatoria', 'cetys'],
    isFeatured: false,
    audiencias: ['aspirantes', 'becarios'],
    prioridad: 'normal',
    estado: 'publicado',
    dias: 9,
    likes: 87,
  },
  {
    id: 'seed-3',
    titulo: 'Taller de Liderazgo y Habilidades Blandas',
    resumen: 'Sesión presencial en campus norte.',
    descripcion: 'Taller gratuito para becarios. Cupo limitado, regístrate desde la app.',
    tags: ['taller', 'evento'],
    isFeatured: false,
    audiencias: ['becarios'],
    prioridad: 'normal',
    estado: 'publicado',
    dias: 17,
    likes: 31,
  },
  {
    id: 'seed-4',
    titulo: 'Convivencia de fin de año',
    resumen: 'Borrador: detalles por confirmar.',
    descripcion: 'Pendiente confirmar sede y horario.',
    tags: ['evento'],
    isFeatured: false,
    audiencias: ['becarios', 'aspirantes'],
    prioridad: 'normal',
    estado: 'borrador',
    dias: 0,
    likes: 0,
  },
] as const;

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

  const cred = await signInWithEmailAndPassword(
    auth,
    requireEnv('SEED_ADMIN_EMAIL'),
    requireEnv('SEED_ADMIN_PASSWORD')
  );

  for (const a of ANUNCIOS) {
    // Las reglas exigen likes == 0 al crear; se ponen en 0 y el conteo real lo generan los usuarios.
    await setDoc(doc(db, 'anuncios', a.id), {
      titulo: a.titulo,
      resumen: a.resumen,
      descripcion: a.descripcion,
      tags: [...a.tags],
      isFeatured: a.isFeatured,
      fecha: haceDias(a.dias),
      autor: 'Fundación Esposos Rodríguez',
      autorFotoUrl: null,
      imagenPrincipal: null,
      imagenesSecundarias: [],
      likes: 0,
      audiencias: [...a.audiencias],
      estado: a.estado,
      prioridad: a.prioridad,
      publicarEn: haceDias(a.dias),
      creadoPor: cred.user.uid,
      creadoEn: haceDias(a.dias),
      actualizadoEn: serverTimestamp(),
    });
    console.log(`✓ ${a.titulo}`);
  }

  console.log(`Listo: ${ANUNCIOS.length} anuncios en la colección "anuncios".`);
  process.exit(0);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`No se pudo sembrar Firestore: ${message}`);
  process.exit(1);
});

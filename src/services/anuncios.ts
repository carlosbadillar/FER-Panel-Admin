import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Audiencia, Prioridad } from '@/types';

export interface AnuncioInput {
  titulo: string;
  resumen: string;
  descripcion: string;
  tags: string[];
  isFeatured: boolean;
  fecha: Date;
  autor: string;
  autorFotoUrl: string | null;
  audiencias: Audiencia[];
  prioridad: Prioridad;
  imagenPrincipal: string | null;
  imagenesSecundarias: string[];
}

function campos(input: AnuncioInput) {
  return {
    titulo: input.titulo.trim(),
    resumen: input.resumen.trim(),
    descripcion: input.descripcion.trim(),
    tags: input.tags,
    isFeatured: input.isFeatured,
    fecha: Timestamp.fromDate(input.fecha),
    autor: input.autor,
    autorFotoUrl: input.autorFotoUrl,
    audiencias: input.audiencias,
    prioridad: input.prioridad,
    imagenPrincipal: input.imagenPrincipal,
    imagenesSecundarias: input.imagenesSecundarias,
  };
}

export async function crearAnuncio(
  input: AnuncioInput,
  uid: string,
  publicar: boolean
): Promise<string> {
  const ref = doc(collection(db, 'anuncios'));
  await setDoc(ref, {
    ...campos(input),
    estado: publicar ? 'publicado' : 'borrador',
    publicarEn: serverTimestamp(),
    likes: 0,
    creadoPor: uid,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

// No cambia el estado ni publicarEn (editar un publicado no lo "re-publica")
export async function actualizarAnuncio(id: string, input: AnuncioInput): Promise<void> {
  await updateDoc(doc(db, 'anuncios', id), {
    ...campos(input),
    actualizadoEn: serverTimestamp(),
  });
}

export async function publicarAnuncio(id: string): Promise<void> {
  await updateDoc(doc(db, 'anuncios', id), {
    estado: 'publicado',
    publicarEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
}

export async function archivarAnuncio(id: string): Promise<void> {
  await updateDoc(doc(db, 'anuncios', id), {
    estado: 'archivado',
    actualizadoEn: serverTimestamp(),
  });
}

export async function eliminarAnuncio(id: string): Promise<void> {
  await deleteDoc(doc(db, 'anuncios', id));
}
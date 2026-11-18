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
  fechaEvento: Date | null;
  fechaFin: Date | null;
  lugar: string | null;
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
    fechaEvento: input.fechaEvento ? Timestamp.fromDate(input.fechaEvento) : null,
    fechaFin: input.fechaFin ? Timestamp.fromDate(input.fechaFin) : null,
    lugar: input.lugar,
  };
}

/**
 * @param publicarEn Opcional. Si se manda una fecha futura junto con publicar=true,
 * el anuncio queda "programado": la app solo debe mostrarlo cuando publicarEn <= ahora.
 */
export async function crearAnuncio(
  input: AnuncioInput,
  uid: string,
  publicar: boolean,
  publicarEn?: Date
): Promise<string> {
  const ref = doc(collection(db, 'anuncios'));
  await setDoc(ref, {
    ...campos(input),
    estado: publicar ? 'publicado' : 'borrador',
    publicarEn: publicarEn ? Timestamp.fromDate(publicarEn) : serverTimestamp(),
    likes: 0,
    creadoPor: uid,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

// No cambia el estado. publicarEn solo cambia si se manda explícitamente
// (p. ej. para reprogramar); editar un publicado no lo "re-publica".
export async function actualizarAnuncio(
  id: string,
  input: AnuncioInput,
  publicarEn?: Date
): Promise<void> {
  await updateDoc(doc(db, 'anuncios', id), {
    ...campos(input),
    ...(publicarEn ? { publicarEn: Timestamp.fromDate(publicarEn) } : {}),
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
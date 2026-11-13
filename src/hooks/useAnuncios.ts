'use client';

import { orderBy } from 'firebase/firestore';
import { useCollection } from '@/hooks/useFirestore';
import type { Anuncio } from '@/types';

const ORDEN = [orderBy('creadoEn', 'desc')];

export function useAnuncios(max = 100) {
  return useCollection<Anuncio>('anuncios', ORDEN, max);
}
'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  limit,
  onSnapshot,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const EMPTY_CONSTRAINTS: QueryConstraint[] = [];

export function useCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = EMPTY_CONSTRAINTS,
  maxItems: number = 50
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(Boolean(db));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    let unsubscribe = () => {};

    try {
      const q = query(collection(db, collectionName), ...constraints, limit(maxItems));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((docSnap) => ({
            ...(docSnap.data() as Omit<T, 'id'>),
            id: docSnap.id,
          })) as T[];
          setData(items);
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.warn(`[FER Conecta] Firestore/${collectionName}:`, err.message);
          setError(err.message);
          setData([]);
          setLoading(false);
        }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo consultar Firestore';
      console.warn(`[FER Conecta] Firestore/${collectionName}:`, message);
      setError(message);
      setData([]);
      setLoading(false);
    }

    return () => unsubscribe();
    // Las restricciones deben ser un arreglo estable (el default del hook lo es).
    // Un arreglo nuevo en cada render reabriría la suscripción.
  }, [collectionName, maxItems, constraints]);

  return { data, loading, error };
}

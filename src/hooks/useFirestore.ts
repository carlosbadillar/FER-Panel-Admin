'use client';

import { useEffect, useRef, useState } from 'react';
import {
  collection,
  limit,
  onSnapshot,
  query,
  queryEqual,
  type DocumentData,
  type Query,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const EMPTY_CONSTRAINTS: QueryConstraint[] = [];

export function useCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = EMPTY_CONSTRAINTS,
  maxItems = 50
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Construimos la query en cada render, pero solo cambiamos la referencia
  // guardada cuando la query es realmente distinta (queryEqual).
  const nextQuery = query(collection(db, collectionName), ...constraints, limit(maxItems));
  const queryRef = useRef<Query>(nextQuery);
  if (!queryEqual(queryRef.current, nextQuery)) {
    queryRef.current = nextQuery;
  }
  const stableQuery = queryRef.current;

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onSnapshot(
      stableQuery,
      (snapshot) => {
        setData(
          snapshot.docs.map((docSnap) => ({
            ...docSnap.data(),
            id: docSnap.id,
          })) as T[]
        );
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

    return unsubscribe;
  }, [stableQuery, collectionName]);

  return { data, loading, error };
}
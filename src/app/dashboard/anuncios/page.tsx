'use client';

import { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import AnnouncementTable from '@/components/metrics/AnnouncementTable';
import AnuncioForm from '@/components/anuncios/AnuncioForm';
import { useAnuncios } from '@/hooks/useAnuncios';
import { exportarCSV } from '@/lib/anuncioUtils';
import type { Anuncio } from '@/types';

export default function AnunciosPage() {
  // null = cerrado, 'nuevo' = crear, Anuncio = editar
  const [formState, setFormState] = useState<null | 'nuevo' | Anuncio>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { data } = useAnuncios();

  function handleSaved(_id: string, publicado: boolean) {
    setToast(publicado ? 'Anuncio guardado y visible en la app.' : 'Anuncio guardado.');
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <span className="badge-blue mb-2">GESTIÓN</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Gestión de Anuncios</h1>
          <p className="text-sm text-gray-400 mt-1">
            Crea, edita, programa, publica, archiva y elimina comunicados para la app FER Conecta
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exportarCSV(data)}
            disabled={data.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-gray-400" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => setFormState('nuevo')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-fer-blue hover:bg-fer-blue-dark text-white font-semibold rounded-lg transition shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo anuncio
          </button>
        </div>
      </div>

      {toast && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {toast}
        </div>
      )}

      <AnnouncementTable onEdit={(a) => setFormState(a)} />

      {formState !== null && (
        <AnuncioForm
          key={formState === 'nuevo' ? 'nuevo' : formState.id}
          anuncio={formState === 'nuevo' ? null : formState}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}


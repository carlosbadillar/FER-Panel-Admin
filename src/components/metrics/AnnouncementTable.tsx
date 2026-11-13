'use client';

import { useMemo, useState } from 'react';
import { Archive, Heart, Pencil, Send, Trash2, Users } from 'lucide-react';
import clsx from 'clsx';
import { useAnuncios } from '@/hooks/useAnuncios';
import {
  archivarAnuncio,
  eliminarAnuncio,
  publicarAnuncio,
} from '@/services/anuncios';
import type { Anuncio, EstadoAnuncio } from '@/types';

type Tab = 'todos' | 'activos' | 'borradores' | 'archivados';

const tabs: { key: Tab; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'activos', label: 'Activos' },
  { key: 'borradores', label: 'Borradores' },
  { key: 'archivados', label: 'Archivados' },
];

const ESTADO_LABEL: Record<EstadoAnuncio, string> = {
  borrador: 'Borrador',
  publicado: 'Publicado',
  archivado: 'Archivado',
};

const ESTADO_BADGE: Record<EstadoAnuncio, string> = {
  borrador: 'bg-gray-100 text-gray-600',
  publicado: 'bg-emerald-50 text-emerald-700',
  archivado: 'bg-amber-50 text-amber-700',
};

const ESTADO_DOT: Record<EstadoAnuncio, string> = {
  borrador: 'bg-gray-300',
  publicado: 'bg-emerald-500',
  archivado: 'bg-amber-500',
};

function matchesTab(a: Anuncio, tab: Tab) {
  if (tab === 'activos') return a.estado === 'publicado';
  if (tab === 'borradores') return a.estado === 'borrador';
  if (tab === 'archivados') return a.estado === 'archivado';
  return true;
}

function formatFecha(a: Anuncio): string {
  const d = a.fecha?.toDate?.();
  if (!d) return '—';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface Props {
  /** Abre el formulario de edición (AnuncioForm) para este anuncio */
  onEdit?: (anuncio: Anuncio) => void;
}

export default function AnnouncementTable({ onEdit }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('todos');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Anuncio | null>(null);

  const { data, loading, error } = useAnuncios();

  const rows = useMemo(() => data.filter((a) => matchesTab(a, activeTab)), [data, activeTab]);

  async function run(id: string, fn: () => Promise<void>) {
    setActionError(null);
    setBusyId(id);
    try {
      await fn();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo completar la acción.');
    } finally {
      setBusyId(null);
    }
  }

  function handlePublicar(a: Anuncio) {
    const destino = a.audiencias.join(' y ');
    if (!window.confirm(`El anuncio será visible para: ${destino}. ¿Publicar?`)) return;
    run(a.id, async () => {
      await publicarAnuncio(a.id);
      setAviso(a); // recordatorio para mandar el push desde Firebase Messaging
    });
  }

  function handleArchivar(a: Anuncio) {
    if (!window.confirm('El anuncio dejará de verse en la app. ¿Archivar?')) return;
    run(a.id, () => archivarAnuncio(a.id));
  }

  function handleEliminar(a: Anuncio) {
    if (!window.confirm(`¿Eliminar «${a.titulo}» definitivamente? No se puede deshacer.`)) return;
    run(a.id, () => eliminarAnuncio(a.id));
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="p-6 pb-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Anuncios</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            Comunicados oficiales para becarios y aspirantes
          </p>
        </div>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden text-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'px-4 py-1.5 font-medium transition',
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-gray-50 text-gray-400 hover:text-gray-600'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {aviso && (
        <div className="mx-6 mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">«{aviso.titulo}» ya es visible en la app.</p>
          <p className="mt-1">
            Para avisar con una notificación, crea una campaña en Firebase → Messaging, tema{' '}
            <strong>{aviso.audiencias.join(' y ')}</strong>, con el dato personalizado{' '}
            <code className="font-mono">anuncioId</code> ={' '}
            <code className="font-mono">{aviso.id}</code>.
          </p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              className="font-medium underline"
              onClick={() => navigator.clipboard.writeText(aviso.id)}
            >
              Copiar ID
            </button>
            <button type="button" className="font-medium underline" onClick={() => setAviso(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {(error || actionError) && (
        <p role="alert" className="mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError ?? `No se pudieron cargar los anuncios: ${error}`}
        </p>
      )}

      <div className="overflow-x-auto mt-4">
        <table className="w-full">
          <thead>
            <tr className="border-y border-gray-100">
              <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Anuncio
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Fecha
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Audiencia
              </th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Likes
              </th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                  Cargando anuncios…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                  No hay anuncios en esta vista.
                </td>
              </tr>
            ) : (
              rows.map((a) => {
                const busy = busyId === a.id;
                return (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={clsx('w-3 h-3 rounded-full flex-shrink-0', ESTADO_DOT[a.estado])} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {a.titulo}
                            {a.prioridad === 'urgente' && (
                              <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-600">
                                Urgente
                              </span>
                            )}
                            {a.isFeatured && (
                              <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-fer-blue">
                                Destacado
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.resumen}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatFecha(a)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="capitalize">{a.audiencias.join(', ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <Heart className="w-4 h-4 text-gray-400" />
                        {(a.likes ?? 0).toLocaleString('es-MX')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={clsx(
                          'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                          ESTADO_BADGE[a.estado]
                        )}
                      >
                        {ESTADO_LABEL[a.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {onEdit && (
                          <button
                            type="button"
                            title="Editar"
                            disabled={busy}
                            onClick={() => onEdit(a)}
                            className="p-1.5 rounded text-gray-400 hover:text-fer-blue hover:bg-gray-100 transition disabled:opacity-40"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {a.estado !== 'publicado' && (
                          <button
                            type="button"
                            title={a.estado === 'archivado' ? 'Republicar' : 'Publicar'}
                            disabled={busy}
                            onClick={() => handlePublicar(a)}
                            className="p-1.5 rounded text-gray-400 hover:text-emerald-600 hover:bg-gray-100 transition disabled:opacity-40"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {a.estado === 'publicado' && (
                          <button
                            type="button"
                            title="Archivar"
                            disabled={busy}
                            onClick={() => handleArchivar(a)}
                            className="p-1.5 rounded text-gray-400 hover:text-amber-600 hover:bg-gray-100 transition disabled:opacity-40"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Eliminar"
                          disabled={busy}
                          onClick={() => handleEliminar(a)}
                          className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-gray-100 transition disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 flex items-center gap-2 text-sm text-gray-400 border-t border-gray-100">
        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
        Mostrando {rows.length} anuncio{rows.length === 1 ? '' : 's'}
      </div>
    </div>
  );
}
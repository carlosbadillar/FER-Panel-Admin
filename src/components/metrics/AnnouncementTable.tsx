'use client';

import { useMemo, useState } from 'react';
import { Users, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { MOCK_ANNOUNCEMENTS } from '@/data/announcements';
import { useCollection } from '@/hooks/useFirestore';
import type { Announcement, TableTab } from '@/types';

interface AnnouncementRow {
  id: string;
  title: string;
  description: string;
  sendDate: string;
  audienceCount: string;
  audienceLabel: string;
  opens: number;
  totalSent: number;
  successRate: number;
  dotColor: string;
  status: Announcement['status'];
}

const DOT_CLASS: Record<Announcement['colorDot'], string> = {
  blue: 'bg-fer-blue',
  green: 'bg-emerald-500',
  orange: 'bg-amber-500',
};

const tabs: { key: TableTab; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'activos', label: 'Activos' },
  { key: 'archivados', label: 'Archivados' },
];

function formatCount(value: number | string | undefined): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toLocaleString('es-MX');
  }
  if (typeof value === 'string' && value.trim()) return value;
  return '0';
}

function toRow(item: Partial<Announcement> & { id: string }): AnnouncementRow | null {
  if (!item.title || !item.description) return null;

  const colorDot = item.colorDot ?? 'blue';
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    sendDate: item.sendDate ?? '—',
    audienceCount: formatCount(item.audienceCount),
    audienceLabel: item.audienceLabel ?? 'Destinatarios',
    opens: typeof item.opens === 'number' ? item.opens : 0,
    totalSent: typeof item.totalSent === 'number' ? item.totalSent : 0,
    successRate: typeof item.successRate === 'number' ? item.successRate : 0,
    dotColor: DOT_CLASS[colorDot] ?? DOT_CLASS.blue,
    status: item.status ?? 'active',
  };
}

const mockRows = MOCK_ANNOUNCEMENTS.map((item) => toRow(item)).filter(
  (row): row is AnnouncementRow => row !== null
);

function matchesTab(row: AnnouncementRow, tab: TableTab) {
  if (tab === 'activos') return row.status === 'active';
  if (tab === 'archivados') return row.status === 'archived';
  return row.status !== 'draft';
}

export default function AnnouncementTable() {
  const [activeTab, setActiveTab] = useState<TableTab>('todos');
  const { data, loading, error } = useCollection<Announcement>('announcements');

  const liveRows = useMemo(
    () =>
      [...data]
        .sort((a, b) => (b.sentAt ?? '').localeCompare(a.sentAt ?? ''))
        .map((item) => toRow(item))
        .filter((row): row is AnnouncementRow => row !== null),
    [data]
  );

  const usingLiveData = !loading && !error && liveRows.length > 0;
  const source = usingLiveData ? liveRows : mockRows;
  const rows = source.filter((row) => matchesTab(row, activeTab));
  const showPrototypeFooter = !usingLiveData && activeTab === 'todos';

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="p-6 pb-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Rendimiento por Anuncio Reciente
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">
            Efectividad y métricas desglosadas por comunicado oficial a becarios
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

      <div className="overflow-x-auto mt-4">
        <table className="w-full">
          <thead>
            <tr className="border-y border-gray-100">
              <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Anuncio / Campaña
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Fecha de Envío
              </th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Audiencia Destino
              </th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Aperturas
              </th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Tasa de Éxito
              </th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                  No hay comunicados en esta vista.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 ${row.dotColor} rounded-full flex-shrink-0`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{row.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{row.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{row.sendDate}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{row.audienceCount}</span>
                      <span className="text-gray-400">{row.audienceLabel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-900">
                      {row.opens.toLocaleString('es-MX')}
                    </span>
                    <span className="text-sm text-gray-400">
                      {' / '}
                      {row.totalSent.toLocaleString('es-MX')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="badge-green">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                      {row.successRate}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm text-fer-blue hover:text-fer-blue-dark font-medium transition"
                    >
                      Ver Detalles
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          {showPrototypeFooter
            ? 'Mostrando 3 de 24 comunicados enviados este semestre'
            : `Mostrando ${rows.length} comunicado${rows.length === 1 ? '' : 's'}`}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button type="button" className="text-gray-300 cursor-not-allowed">
            Anterior
          </button>
          <span className="px-3 py-1 bg-gray-100 rounded font-medium text-gray-700">1</span>
          <span className="text-gray-400">{showPrototypeFooter ? 'de 8' : 'de 1'}</span>
          <button
            type="button"
            className={
              showPrototypeFooter
                ? 'text-gray-600 hover:text-gray-900 font-medium transition'
                : 'text-gray-300 cursor-not-allowed font-medium'
            }
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

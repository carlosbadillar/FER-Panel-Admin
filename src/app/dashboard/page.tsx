'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Download, Plus } from 'lucide-react';
import KPIRow from '@/components/metrics/KPIRow';
import EngagementChart from '@/components/metrics/EngagementChart';
import AnnouncementTable from '@/components/metrics/AnnouncementTable';
import { useAnuncios } from '@/hooks/useAnuncios';
import { calcularMetricas, type Periodo } from '@/lib/metrics';
import { exportarCSV } from '@/lib/anuncioUtils';

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: 7, label: 'Últimos 7 días' },
  { value: 30, label: 'Últimos 30 días' },
  { value: 90, label: 'Últimos 90 días' },
];

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>(30);
  const { data, loading, error } = useAnuncios(500);
  const metricas = useMemo(() => calcularMetricas(data, periodo), [data, periodo]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <span className="badge-blue">MÓDULO ANALÍTICO</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Métricas de Impacto y Rendimiento</h1>
          <p className="text-sm text-gray-400 mt-1">
            Estadísticas de comunicación, entrega y vinculación estratégica de la fundación
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <select
              value={periodo}
              onChange={(e) => setPeriodo(Number(e.target.value) as Periodo)}
              className="appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-fer-blue/30"
            >
              {PERIODOS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <svg className="w-4 h-4 text-gray-400 absolute right-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </label>
          <button
            type="button"
            onClick={() => exportarCSV(data)}
            disabled={data.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-fer-blue hover:bg-fer-blue-dark text-white font-semibold rounded-lg transition shadow-sm text-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar Reporte
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          No se pudieron cargar las métricas: {error}
        </p>
      )}

      <KPIRow m={metricas} periodo={periodo} loading={loading} />

      <EngagementChart data={metricas.semanas} />

      <div className="space-y-3">
        <AnnouncementTable
          limit={5}
          title="Anuncios Recientes"
          subtitle="Los 5 comunicados más recientes. Gestiona todos desde Gestión de Anuncios."
        />
        <div className="flex justify-end">
          <Link
            href="/dashboard/anuncios"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-fer-blue hover:text-fer-blue-dark"
          >
            <Plus className="w-4 h-4" /> Crear o gestionar anuncios
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Calendar, Download } from 'lucide-react';
import KPIRow from '@/components/metrics/KPIRow';
import EngagementChart from '@/components/metrics/EngagementChart';
import AnnouncementTable from '@/components/metrics/AnnouncementTable';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-blue">MÓDULO ANALÍTICO</span>
            <span className="text-xs text-gray-400">v2.4</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Métricas de Impacto y Rendimiento
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Estadísticas de comunicación, entrega y vinculación estratégica de
            la fundación
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            Últimos 30 días
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-fer-blue hover:bg-fer-blue-dark text-white font-semibold rounded-lg transition shadow-sm text-sm">
            <Download className="w-4 h-4" />
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPIRow />

      {/* Engagement Chart */}
      <EngagementChart />

      {/* Announcement Table */}
      <AnnouncementTable />
    </div>
  );
}


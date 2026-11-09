import KPICard from './KPICard';
import { Play, Bell, Eye, MousePointerClick } from 'lucide-react';

export default function KPIRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {/* Anuncios Enviados */}
      <KPICard
        label="Anuncios Enviados"
        value="24"
        icon={<Play className="w-5 h-5 text-white fill-white" />}
        iconBg="bg-fer-blue"
      >
        <span className="text-emerald-500 font-medium">+3</span>
        <span className="text-gray-400 ml-1">este mes</span>
      </KPICard>

      {/* Notificaciones Push */}
      <KPICard
        label="Notificaciones Push"
        value="18,500"
        icon={<Bell className="w-5 h-5 text-white" />}
        iconBg="bg-fer-blue"
      >
        <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
          99.2%
        </span>
        <span className="text-gray-400 ml-1">entrega exitosa</span>
      </KPICard>

      {/* Tasa de Apertura */}
      <KPICard
        label="Tasa de Apertura"
        value="76.4%"
        icon={<Eye className="w-5 h-5 text-white" />}
        iconBg="bg-fer-blue"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge-green">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            4.6%
          </span>
          <span className="text-gray-400 text-xs">
            vs. 72.4% periodo anterior
          </span>
        </div>
      </KPICard>

      {/* Clics en Enlaces */}
      <KPICard
        label="Clics en Enlaces"
        value="5,210"
        icon={<MousePointerClick className="w-5 h-5 text-white" />}
        iconBg="bg-fer-blue"
      >
        <span className="text-emerald-500 font-medium">28.1%</span>
        <span className="text-gray-400 ml-1 text-xs">
          tasa de click-through (CTR)
        </span>
      </KPICard>
    </div>
  );
}


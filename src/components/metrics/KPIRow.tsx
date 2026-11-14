import KPICard from './KPICard';
import { CalendarClock, Eye, Heart, Send } from 'lucide-react';
import type { DashboardMetrics, Periodo } from '@/lib/metrics';

interface Props {
  m: DashboardMetrics;
  periodo: Periodo;
  loading?: boolean;
}

function Delta({ actual, anterior }: { actual: number; anterior: number }) {
  const diff = actual - anterior;
  if (diff === 0) return <span className="text-gray-400">sin cambio</span>;
  const up = diff > 0;
  return (
    <span className={up ? 'badge-green' : 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600'}>
      {up ? '↑' : '↓'} {Math.abs(diff)}
    </span>
  );
}

export default function KPIRow({ m, periodo, loading }: Props) {
  const v = (n: number | string) => (loading ? '—' : String(n));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <KPICard
        label="Anuncios Publicados"
        value={v(m.publicadosPeriodo)}
        icon={<Send className="w-5 h-5 text-white" />}
        iconBg="bg-fer-blue"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Delta actual={m.publicadosPeriodo} anterior={m.publicadosPeriodoAnterior} />
          <span className="text-gray-400 text-xs">vs. {periodo} días anteriores</span>
        </div>
      </KPICard>

      <KPICard
        label="Visibles en la App"
        value={v(m.visibles)}
        icon={<Eye className="w-5 h-5 text-white" />}
        iconBg="bg-fer-blue"
      >
        <span className="text-gray-400 text-xs">
          {m.porAudiencia.becarios} becarios · {m.porAudiencia.aspirantes} aspirantes
          {m.urgentes > 0 && <span className="text-red-500 font-medium"> · {m.urgentes} urgentes</span>}
        </span>
      </KPICard>

      <KPICard
        label="Likes Recibidos"
        value={v(m.likesPeriodo.toLocaleString('es-MX'))}
        icon={<Heart className="w-5 h-5 text-white" />}
        iconBg="bg-fer-blue"
      >
        <span className="text-emerald-500 font-medium">{m.likesPromedio.toFixed(1)}</span>
        <span className="text-gray-400 ml-1 text-xs">promedio por anuncio</span>
      </KPICard>

      <KPICard
        label="Programados / Borradores"
        value={v(`${m.programados} / ${m.borradores}`)}
        icon={<CalendarClock className="w-5 h-5 text-white" />}
        iconBg="bg-fer-blue"
      >
        <span className="text-gray-400 text-xs">{m.archivados} archivados</span>
      </KPICard>
    </div>
  );
}

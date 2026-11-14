'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import type { SemanaPunto } from '@/lib/metrics';

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0]?.payload as SemanaPunto | undefined;
  return (
    <div className="bg-slate-800 text-white rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold mb-1">
        {label} <span className="font-normal text-slate-400">· {p?.rango}</span>
      </p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full" />
          {p?.likes.toLocaleString('es-MX')} likes
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
          {p?.publicados} anuncios publicados
        </div>
      </div>
    </div>
  );
}

export default function EngagementChart({ data }: { data: SemanaPunto[] }) {
  const vacio = data.every((d) => d.likes === 0 && d.publicados === 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tendencia de Engagement</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            Likes y anuncios publicados por semana durante las últimas 4 semanas
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
            Likes
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            Anuncios publicados
          </span>
        </div>
      </div>

      <div className="h-[300px] relative">
        {vacio && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <p className="rounded-lg bg-white/90 px-4 py-2 text-sm text-gray-400 border border-gray-100">
              Aún no hay publicaciones en las últimas 4 semanas
            </p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 30 }}>
            <defs>
              <linearGradient id="gLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gPub" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => {
                const d = data.find((p) => p.label === payload.value);
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text x={0} y={12} textAnchor="middle" className="text-xs fill-gray-600 font-medium">
                      {payload.value}
                    </text>
                    <text x={0} y={28} textAnchor="middle" className="text-[10px] fill-gray-400">
                      {d?.rango}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis yAxisId="likes" axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={40} />
            <YAxis yAxisId="pub" orientation="right" axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={30} />
            <Tooltip content={<CustomTooltip />} />
            <Area yAxisId="likes" type="monotone" dataKey="likes" stroke="#2563EB" strokeWidth={2.5} fill="url(#gLikes)" dot={{ r: 4, fill: '#fff', stroke: '#2563EB', strokeWidth: 2 }} />
            <Area yAxisId="pub" type="monotone" dataKey="publicados" stroke="#10B981" strokeWidth={2.5} fill="url(#gPub)" dot={{ r: 4, fill: '#fff', stroke: '#10B981', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

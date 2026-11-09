'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

const weeklyData = [
  { week: 'Semana 1', dateRange: '23 - 29 Sep', pushOpens: 2200, linkClicks: 980 },
  { week: 'Semana 2', dateRange: '30 Sep - 06 Oct', pushOpens: 3100, linkClicks: 1420 },
  { week: 'Semana 3', dateRange: '07 - 13 Oct', pushOpens: 5420, linkClicks: 1840 },
  { week: 'Semana 4', dateRange: '14 - 20 Oct', pushOpens: 4800, linkClicks: 1650 },
];

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  const isPeak = label === 'Semana 3';

  return (
    <div className="bg-slate-800 text-white rounded-xl px-4 py-3 shadow-xl text-sm">
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="font-semibold">
          {label} {isPeak && '· Pico'}
        </span>
        {isPeak && (
          <span className="px-2 py-0.5 bg-emerald-500 rounded-full text-xs font-bold">
            +18%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full" />
          {payload[0]?.value?.toLocaleString()} aperturas
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
          {payload[1]?.value?.toLocaleString()} clics en links
        </div>
      </div>
    </div>
  );
}

export default function EngagementChart() {
  const [period, setPeriod] = useState<'weeks' | 'days'>('weeks');

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Tendencia de Engagement y Apertura
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">
            Evolución semanal de interacciones durante las últimas 4 semanas
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
              Aperturas Push
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              Clics en Convocatorias
            </span>
          </div>
          {/* Period Toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden text-sm">
            <button
              onClick={() => setPeriod('weeks')}
              className={`px-3 py-1.5 font-medium transition ${
                period === 'weeks'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-gray-50 text-gray-400 hover:text-gray-600'
              }`}
            >
              Semanas
            </button>
            <button
              onClick={() => setPeriod('days')}
              className={`px-3 py-1.5 font-medium transition ${
                period === 'days'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-gray-50 text-gray-400 hover:text-gray-600'
              }`}
            >
              Días
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={weeklyData}
            margin={{ top: 5, right: 20, left: 0, bottom: 30 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => {
                const d = weeklyData.find((d) => d.week === payload.value);
                const isPeak = payload.value === 'Semana 3';
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={12}
                      textAnchor="middle"
                      className={`text-xs ${
                        isPeak
                          ? 'fill-emerald-600 font-semibold'
                          : 'fill-gray-500'
                      }`}
                    >
                      {payload.value}
                    </text>
                    <text
                      x={0}
                      y={28}
                      textAnchor="middle"
                      className="text-[10px] fill-gray-400"
                    >
                      {d?.dateRange}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={(val: number) =>
                val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(val)
              }
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="pushOpens"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={{ r: 5, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{
                r: 7,
                fill: '#2563EB',
                stroke: '#fff',
                strokeWidth: 3,
              }}
            />
            <Line
              type="monotone"
              dataKey="linkClicks"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{
                r: 7,
                fill: '#10B981',
                stroke: '#fff',
                strokeWidth: 3,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


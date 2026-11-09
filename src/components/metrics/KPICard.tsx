import { ReactNode } from 'react';

interface KPICardProps {
  label: string;
  value: string;
  icon: ReactNode;
  iconBg: string;
  children?: ReactNode;
}

export default function KPICard({ label, value, icon, iconBg, children }: KPICardProps) {
  return (
    <div className="kpi-card">
      <div
        className={`absolute top-4 right-4 w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}
      >
        {icon}
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}


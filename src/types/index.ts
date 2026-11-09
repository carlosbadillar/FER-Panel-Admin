export interface KPIMetric {
  id: string;
  label: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  subtitle: string;
  badge?: {
    text: string;
    type: 'success' | 'warning' | 'info';
  };
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  sendDate: string;
  sentAt: string;
  audienceType: string;
  audienceCount: number;
  audienceLabel: string;
  opens: number;
  totalSent: number;
  successRate: number;
  status: 'active' | 'archived' | 'draft';
  colorDot: 'blue' | 'green' | 'orange';
}

export interface ChartDataPoint {
  week: string;
  dateRange: string;
  pushOpens: number;
  linkClicks: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'viewer';
  photoURL?: string;
}

/** Sesión del panel: usuario de Firebase o acceso demo local. */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isDemo: boolean;
}

export type DateFilter = '7d' | '30d' | '90d' | '12m';
export type TableTab = 'todos' | 'activos' | 'archivados';

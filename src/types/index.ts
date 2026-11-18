import type { Timestamp } from 'firebase/firestore';

export const AUDIENCIAS = ['becarios', 'aspirantes'] as const;
export type Audiencia = (typeof AUDIENCIAS)[number];

export type EstadoAnuncio = 'borrador' | 'publicado' | 'archivado';
export type Prioridad = 'normal' | 'urgente';

export interface Anuncio {
  id: string;
  titulo: string;
  resumen: string;
  descripcion: string;
  tags: string[];
  isFeatured: boolean;
  fecha: Timestamp;
  autor: string;
  autorFotoUrl: string | null;
  imagenPrincipal: string | null;     // URL 
  imagenesSecundarias: string[];      // URLs
  likes: number;
  audiencias: Audiencia[];
  estado: EstadoAnuncio;
  prioridad: Prioridad;
  publicarEn: Timestamp;
  creadoPor: string;
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
  fechaEvento?: Timestamp | null;   // inicio, con hora
  fechaFin?: Timestamp | null;
  lugar?: string | null;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
}
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

export interface ChartDataPoint {
  week: string;
  dateRange: string;
  pushOpens: number;
  linkClicks: number;
}

export type DateFilter = '7d' | '30d' | '90d' | '12m';
export type TableTab = 'todos' | 'activos' | 'archivados';

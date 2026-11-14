import { isProgramado, isVisible, toDate } from '@/lib/anuncioUtils';
import type { Anuncio } from '@/types';

export type Periodo = 7 | 30 | 90;

export interface SemanaPunto {
  label: string;
  rango: string;
  publicados: number;
  likes: number;
}

export interface DashboardMetrics {
  publicadosPeriodo: number;
  publicadosPeriodoAnterior: number;
  visibles: number;
  programados: number;
  borradores: number;
  archivados: number;
  urgentes: number;
  likesPeriodo: number;
  likesPromedio: number;
  porAudiencia: { becarios: number; aspirantes: number };
  semanas: SemanaPunto[];
}

const DIA = 24 * 60 * 60 * 1000;

function fechaPublicacion(a: Anuncio): Date | null {
  return a.estado === 'publicado' ? toDate(a.publicarEn) : null;
}

function rangoCorto(desde: Date, hasta: Date) {
  const f = (d: Date) => d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  return `${f(desde)} – ${f(hasta)}`;
}

/** Calcula todas las métricas del dashboard a partir de la colección `anuncios`. */
export function calcularMetricas(anuncios: Anuncio[], periodo: Periodo, now = new Date()): DashboardMetrics {
  const inicio = new Date(now.getTime() - periodo * DIA);
  const inicioAnterior = new Date(now.getTime() - 2 * periodo * DIA);

  const enRango = (a: Anuncio, desde: Date, hasta: Date) => {
    const d = fechaPublicacion(a);
    return !!d && d >= desde && d < hasta && !isProgramado(a, now);
  };

  const delPeriodo = anuncios.filter((a) => enRango(a, inicio, now));
  const delAnterior = anuncios.filter((a) => enRango(a, inicioAnterior, inicio));
  const likesPeriodo = delPeriodo.reduce((s, a) => s + (a.likes ?? 0), 0);

  const visibles = anuncios.filter((a) => isVisible(a, now));

  // Últimas 4 semanas (de la más antigua a la más reciente)
  const semanas: SemanaPunto[] = [];
  for (let i = 3; i >= 0; i--) {
    const hasta = new Date(now.getTime() - i * 7 * DIA);
    const desde = new Date(hasta.getTime() - 7 * DIA);
    const items = anuncios.filter((a) => enRango(a, desde, hasta));
    semanas.push({
      label: `Semana ${4 - i}`,
      rango: rangoCorto(desde, new Date(hasta.getTime() - DIA)),
      publicados: items.length,
      likes: items.reduce((s, a) => s + (a.likes ?? 0), 0),
    });
  }

  return {
    publicadosPeriodo: delPeriodo.length,
    publicadosPeriodoAnterior: delAnterior.length,
    visibles: visibles.length,
    programados: anuncios.filter((a) => isProgramado(a, now)).length,
    borradores: anuncios.filter((a) => a.estado === 'borrador').length,
    archivados: anuncios.filter((a) => a.estado === 'archivado').length,
    urgentes: visibles.filter((a) => a.prioridad === 'urgente').length,
    likesPeriodo,
    likesPromedio: delPeriodo.length ? likesPeriodo / delPeriodo.length : 0,
    porAudiencia: {
      becarios: visibles.filter((a) => a.audiencias.includes('becarios')).length,
      aspirantes: visibles.filter((a) => a.audiencias.includes('aspirantes')).length,
    },
    semanas,
  };
}


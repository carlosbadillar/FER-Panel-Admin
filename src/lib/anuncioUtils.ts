import type { Timestamp } from 'firebase/firestore';
import type { Anuncio } from '@/types';

/** Convierte un Timestamp de Firestore a Date (puede ser null mientras serverTimestamp() se resuelve). */
export function toDate(ts: Timestamp | null | undefined): Date | null {
  return ts?.toDate?.() ?? null;
}

/** Publicado pero con publicarEn en el futuro → programado. */
export function isProgramado(a: Anuncio, now = new Date()): boolean {
  const d = toDate(a.publicarEn);
  return a.estado === 'publicado' && !!d && d > now;
}

/** Visible en la app ahora mismo. */
export function isVisible(a: Anuncio, now = new Date()): boolean {
  return a.estado === 'publicado' && !isProgramado(a, now);
}

export function formatFechaCorta(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatFechaHora(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Date → valor para <input type="datetime-local"> en hora local. */
export function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Date → valor para <input type="date"> en hora local. */
export function toDateInput(d: Date): string {
  return toDatetimeLocal(d).slice(0, 10);
}

/** Exporta anuncios a CSV y dispara la descarga en el navegador. */
export function exportarCSV(anuncios: Anuncio[]) {
  const header = ['id', 'titulo', 'estado', 'prioridad', 'audiencias', 'likes', 'fecha', 'publicarEn', 'creadoEn'];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = anuncios.map((a) =>
    [
      a.id,
      a.titulo,
      isProgramado(a) ? 'programado' : a.estado,
      a.prioridad,
      a.audiencias.join(' | '),
      a.likes ?? 0,
      toDate(a.fecha)?.toISOString() ?? '',
      toDate(a.publicarEn)?.toISOString() ?? '',
      toDate(a.creadoEn)?.toISOString() ?? '',
    ]
      .map(esc)
      .join(',')
  );
  const csv = '\uFEFF' + [header.join(','), ...rows].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-anuncios-${toDateInput(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}


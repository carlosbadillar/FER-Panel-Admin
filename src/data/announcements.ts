import type { Announcement } from '@/types';

/**
 * Campañas del prototipo del panel. Sirven como semilla de Firestore
 * y como respaldo visual cuando la colección está vacía o no hay conexión.
 */
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'renovacion-beca-preparatoria',
    title: 'Renovación Beca Preparatoria',
    description: 'Recordatorio entrega documentación semestral',
    sendDate: '14 Oct 2026',
    sentAt: '2026-10-14',
    audienceType: 'becarios',
    audienceCount: 850,
    audienceLabel: 'Becarios Prepa',
    opens: 714,
    totalSent: 850,
    successRate: 84,
    status: 'active',
    colorDot: 'blue',
  },
  {
    id: 'convocatoria-cetys',
    title: 'Convocatoria CETYS',
    description: 'Apertura de registro excelencia académica 2025',
    sendDate: '08 Oct 2026',
    sentAt: '2026-10-08',
    audienceType: 'candidatos',
    audienceCount: 1200,
    audienceLabel: 'Candidatos',
    opens: 948,
    totalSent: 1200,
    successRate: 79,
    status: 'active',
    colorDot: 'green',
  },
  {
    id: 'taller-liderazgo',
    title: 'Taller de Liderazgo y Habilidades Blandas',
    description: 'Sesión presencial campus norte',
    sendDate: '01 Oct 2026',
    sentAt: '2026-10-01',
    audienceType: 'becarios',
    audienceCount: 420,
    audienceLabel: 'Becarios',
    opens: 386,
    totalSent: 420,
    successRate: 92,
    status: 'active',
    colorDot: 'orange',
  },
];

export function announcementPayload(item: Announcement): Omit<Announcement, 'id'> {
  const { id: _id, ...rest } = item;
  return rest;
}

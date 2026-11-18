'use client';

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { CalendarClock, ImageIcon, Plus, Save, Send, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { actualizarAnuncio, crearAnuncio, type AnuncioInput } from '@/services/anuncios';
import { isProgramado, toDate, toDateInput, toDatetimeLocal } from '@/lib/anuncioUtils';
import { AUDIENCIAS, type Anuncio, type Audiencia, type Prioridad } from '@/types';
import type { Timestamp } from 'firebase/firestore';

// Límites alineados con firestore.rules → anuncioValido()
const MAX_TITULO = 120;
const MAX_RESUMEN = 300;
const MAX_DESCRIPCION = 10000;
const MAX_TAGS = 10;
const MAX_IMAGENES = 10;
const MAX_LUGAR = 200;

function aDatetimeLocal(ts: Timestamp | null | undefined) {
  const d = toDate(ts);
  return d ? toDatetimeLocal(d) : '';
}

const AUDIENCIA_LABEL: Record<Audiencia, string> = {
  becarios: 'Becarios',
  aspirantes: 'Aspirantes',
};

type Modo = 'borrador' | 'ahora' | 'programar';

interface Props {
  /** Si viene, el formulario edita; si no, crea uno nuevo. */
  anuncio?: Anuncio | null;
  onClose: () => void;
  onSaved?: (id: string, publicado: boolean) => void;
}

function isUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export default function AnuncioForm({ anuncio, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const editando = !!anuncio;

  const [titulo, setTitulo] = useState(anuncio?.titulo ?? '');
  const [resumen, setResumen] = useState(anuncio?.resumen ?? '');
  const [descripcion, setDescripcion] = useState(anuncio?.descripcion ?? '');
  const [tagsText, setTagsText] = useState((anuncio?.tags ?? []).join(', '));
  const [isFeatured, setIsFeatured] = useState(anuncio?.isFeatured ?? false);
  const [fecha, setFecha] = useState(toDateInput(toDate(anuncio?.fecha) ?? new Date()));
  const [autor, setAutor] = useState(
    anuncio?.autor ?? user?.displayName ?? 'Fundación Esposos Rodríguez'
  );
  const [autorFotoUrl, setAutorFotoUrl] = useState(anuncio?.autorFotoUrl ?? user?.photoURL ?? '');
  const [audiencias, setAudiencias] = useState<Audiencia[]>(anuncio?.audiencias ?? ['becarios']);
  const [prioridad, setPrioridad] = useState<Prioridad>(anuncio?.prioridad ?? 'normal');
  const [imagenPrincipal, setImagenPrincipal] = useState(anuncio?.imagenPrincipal ?? '');
  const [imagenes, setImagenes] = useState<string[]>(anuncio?.imagenesSecundarias ?? []);
  const [nuevaImagen, setNuevaImagen] = useState('');

  const programadoActual = anuncio ? isProgramado(anuncio) : false;
  const [modo, setModo] = useState<Modo>(programadoActual ? 'programar' : 'borrador');
  const [publicarEn, setPublicarEn] = useState(
    toDatetimeLocal(
      (programadoActual ? toDate(anuncio?.publicarEn) : null) ??
        new Date(Date.now() + 60 * 60 * 1000)
    )
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [esEvento, setEsEvento] = useState(
    !!anuncio?.fechaEvento || (anuncio?.tags?.[0] ?? '').toLowerCase().includes('evento')
  );
  const [fechaEvento, setFechaEvento] = useState(aDatetimeLocal(anuncio?.fechaEvento));
  const [fechaFin, setFechaFin] = useState(aDatetimeLocal(anuncio?.fechaFin));
  const [lugar, setLugar] = useState(anuncio?.lugar ?? '');

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !saving && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  const tags = useMemo(
    () =>
      Array.from(
        new Set(
          tagsText
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        )
      ),
    [tagsText]
  );
    // La app reconoce un evento por su PRIMER tag; si es evento, se garantiza que sea "evento".
  const tagsFinal = useMemo(
    () => (esEvento ? ['evento', ...tags.filter((t) => t !== 'evento')] : tags),
    [esEvento, tags]
  );

  function toggleAudiencia(a: Audiencia) {
    setAudiencias((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function alternarEvento(activo: boolean) {
    setEsEvento(activo);
    if (activo && !fechaEvento) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      setFechaEvento(toDatetimeLocal(d));
    }
  }

  function agregarImagen() {
    const url = nuevaImagen.trim();
    if (!url) return;
    if (!isUrl(url)) return setError('La URL de la imagen no es válida.');
    if (imagenes.length >= MAX_IMAGENES) return setError(`Máximo ${MAX_IMAGENES} imágenes.`);
    setImagenes((prev) => [...prev, url]);
    setNuevaImagen('');
    setError(null);
  }

  function validar(): string | null {
    if (!titulo.trim()) return 'El título es obligatorio.';
    if (titulo.length > MAX_TITULO) return `El título admite máximo ${MAX_TITULO} caracteres.`;
    if (resumen.length > MAX_RESUMEN) return `El resumen admite máximo ${MAX_RESUMEN} caracteres.`;
    if (descripcion.length > MAX_DESCRIPCION)
      return `La descripción admite máximo ${MAX_DESCRIPCION} caracteres.`;
    if (tagsFinal.length > MAX_TAGS) return `Máximo ${MAX_TAGS} etiquetas.`;
    if (audiencias.length === 0) return 'Selecciona al menos una audiencia.';
    if (!fecha) return 'La fecha es obligatoria.';
    if (imagenPrincipal.trim() && !isUrl(imagenPrincipal.trim()))
      return 'La URL de la imagen principal no es válida.';
    if (autorFotoUrl.trim() && !isUrl(autorFotoUrl.trim()))
      return 'La URL de la foto del autor no es válida.';
    if (modo === 'programar') {
      const d = new Date(publicarEn);
      if (isNaN(d.getTime())) return 'Fecha de programación inválida.';
      if (d <= new Date()) return 'La fecha de programación debe ser futura.';
    }
    if (esEvento) {
      if (!fechaEvento) return 'La fecha y hora de inicio del evento es obligatoria.';
      const inicio = new Date(fechaEvento);
      if (isNaN(inicio.getTime())) return 'Fecha de inicio del evento inválida.';
      if (fechaFin) {
        const fin = new Date(fechaFin);
        if (isNaN(fin.getTime())) return 'Fecha de fin del evento inválida.';
        if (fin <= inicio) return 'El fin del evento debe ser posterior al inicio.';
      }
      if (lugar.length > MAX_LUGAR) return `El lugar admite máximo ${MAX_LUGAR} caracteres.`;
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return setError('Tu sesión expiró. Vuelve a iniciar sesión.');
    const msg = validar();
    if (msg) return setError(msg);

    const input: AnuncioInput = {
      titulo,
      resumen,
      descripcion,
      tags: tagsFinal,
      isFeatured,
      // mediodía local para que la fecha no se recorra por zona horaria
      fecha: new Date(`${fecha}T12:00:00`),
      autor: autor.trim() || 'Fundación Esposos Rodríguez',
      autorFotoUrl: autorFotoUrl.trim() || null,
      audiencias,
      prioridad,
      imagenPrincipal: imagenPrincipal.trim() || null,
      imagenesSecundarias: imagenes,
      fechaEvento: esEvento ? new Date(fechaEvento) : null,
      fechaFin: esEvento && fechaFin ? new Date(fechaFin) : null,
      lugar: esEvento && lugar.trim() ? lugar.trim() : null,
    };

    setSaving(true);
    setError(null);
    try {
      const programarDate = modo === 'programar' ? new Date(publicarEn) : undefined;
      if (editando && anuncio) {
        await actualizarAnuncio(anuncio.id, input, programarDate);
        onSaved?.(anuncio.id, anuncio.estado === 'publicado');
      } else {
        const id = await crearAnuncio(input, user.uid, modo !== 'borrador', programarDate);
        onSaved?.(id, modo === 'ahora');
      }
      onClose();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(
        code === 'permission-denied'
          ? 'Firestore rechazó el anuncio: revisa que tu cuenta sea de administrador y que los campos cumplan los límites.'
          : err instanceof Error
            ? err.message
            : 'No se pudo guardar el anuncio.'
      );
    } finally {
      setSaving(false);
    }
  }

  const submitLabel = editando
    ? 'Guardar cambios'
    : modo === 'borrador'
      ? 'Guardar borrador'
      : modo === 'ahora'
        ? 'Publicar ahora'
        : 'Programar publicación';

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-slate-900/40 backdrop-blur-sm">
      <div className="flex-1" onClick={() => !saving && onClose()} />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editando ? 'Editar anuncio' : 'Nuevo anuncio'}
            </h2>
            <p className="text-sm text-gray-400">
              {editando
                ? 'Los cambios se reflejan en la app en tiempo real.'
                : 'Crea un comunicado para becarios y/o aspirantes.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <Field label="Título" count={`${titulo.length}/${MAX_TITULO}`} required>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={MAX_TITULO}
              placeholder="Ej. Renovación Beca Preparatoria"
              className="input"
            />
          </Field>

          <Field label="Resumen" hint="Se muestra en la tarjeta y en la notificación." count={`${resumen.length}/${MAX_RESUMEN}`}>
            <textarea
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              maxLength={MAX_RESUMEN}
              rows={2}
              placeholder="Recordatorio de entrega de documentación semestral"
              className="input resize-none"
            />
          </Field>

          <Field label="Descripción completa" count={`${descripcion.length}/${MAX_DESCRIPCION}`}>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={MAX_DESCRIPCION}
              rows={7}
              placeholder="Detalles, requisitos, fechas límite, enlaces…"
              className="input"
            />
          </Field>

          {/* Audiencia + prioridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Audiencia" required>
              <div className="flex gap-2">
                {AUDIENCIAS.map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => toggleAudiencia(a)}
                    className={clsx(
                      'flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition',
                      audiencias.includes(a)
                        ? 'border-fer-blue bg-blue-50 text-fer-blue'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    )}
                  >
                    {AUDIENCIA_LABEL[a]}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Prioridad">
              <div className="flex gap-2">
                {(['normal', 'urgente'] as Prioridad[]).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPrioridad(p)}
                    className={clsx(
                      'flex-1 px-3 py-2 rounded-lg border text-sm font-medium capitalize transition',
                      prioridad === p
                        ? p === 'urgente'
                          ? 'border-red-400 bg-red-50 text-red-600'
                          : 'border-fer-blue bg-blue-50 text-fer-blue'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Fecha del anuncio" required>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input" />
            </Field>
            <Field label="Etiquetas" hint="Separadas por coma." count={`${tags.length}/${MAX_TAGS}`}>
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="convocatoria, renovación, cetys"
                className="input"
              />
            </Field>
          </div>
          
          {/* Evento */}
          <div className="rounded-xl border border-gray-100 p-4 space-y-4">
            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={esEvento}
                onChange={(e) => alternarEvento(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-fer-blue focus:ring-fer-blue"
              />
              <CalendarClock className="w-4 h-4 text-gray-400" /> Este anuncio es un evento
            </label>
            {esEvento && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Inicio del evento" required hint="Hora de tu zona horaria.">
                    <input
                      type="datetime-local"
                      value={fechaEvento}
                      onChange={(e) => setFechaEvento(e.target.value)}
                      className="input"
                    />
                  </Field>
                  <Field label="Fin del evento" hint="Opcional. Si lo usas, completa también la hora.">
                    <input
                      type="datetime-local"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="input"
                    />
                    {fechaFin && (
                      <button
                        type="button"
                        onClick={() => setFechaFin('')}
                        className="mt-1 text-xs text-gray-400 hover:text-gray-600"
                      >
                        Quitar fin
                      </button>
                    )}
                  </Field>
                </div>
                <Field label="Lugar" hint="Opcional." count={`${lugar.length}/${MAX_LUGAR}`}>
                  <input
                    value={lugar}
                    onChange={(e) => setLugar(e.target.value)}
                    maxLength={MAX_LUGAR}
                    placeholder="Ej. Campus norte, salón 3"
                    className="input"
                  />
                </Field>
                <p className="text-xs text-gray-400">
                  Al guardar, "evento" queda como primera etiqueta; así la app muestra "Agregar a calendario".
                </p>
              </>
            )}
          </div>
          <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-fer-blue focus:ring-fer-blue"
            />
            Destacar en el inicio de la app
          </label>

          {/* Imágenes */}
          <div className="rounded-xl border border-gray-100 p-4 space-y-4">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-400" /> Imágenes (URLs https)
            </p>
            <Field label="Imagen principal">
              <input
                value={imagenPrincipal}
                onChange={(e) => setImagenPrincipal(e.target.value)}
                placeholder="https://…/portada.jpg"
                className="input"
              />
            </Field>
            {imagenPrincipal && isUrl(imagenPrincipal) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagenPrincipal} alt="Vista previa" className="h-32 w-full object-cover rounded-lg border" />
            )}
            <Field label="Imágenes secundarias" count={`${imagenes.length}/${MAX_IMAGENES}`}>
              <div className="flex gap-2">
                <input
                  value={nuevaImagen}
                  onChange={(e) => setNuevaImagen(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarImagen())}
                  placeholder="https://…/foto.jpg"
                  className="input"
                />
                <button type="button" onClick={agregarImagen} className="px-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </Field>
            {imagenes.length > 0 && (
              <ul className="space-y-1">
                {imagenes.map((url, i) => (
                  <li key={`${url}-${i}`} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="flex-1 truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => setImagenes((prev) => prev.filter((_, idx) => idx !== i))}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Autor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Autor">
              <input value={autor} onChange={(e) => setAutor(e.target.value)} className="input" />
            </Field>
            <Field label="Foto del autor (URL)">
              <input value={autorFotoUrl} onChange={(e) => setAutorFotoUrl(e.target.value)} placeholder="https://…" className="input" />
            </Field>
          </div>

          {/* Publicación */}
          {(!editando || programadoActual) && (
            <div className="rounded-xl border border-gray-100 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-gray-400" /> Publicación
              </p>
              {!editando && (
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ['borrador', 'Borrador'],
                    ['ahora', 'Publicar ahora'],
                    ['programar', 'Programar'],
                  ] as [Modo, string][]).map(([m, label]) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setModo(m)}
                      className={clsx(
                        'px-3 py-2 rounded-lg border text-sm font-medium transition',
                        modo === m
                          ? 'border-fer-blue bg-blue-50 text-fer-blue'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {modo === 'programar' && (
                <Field label="Publicar el" hint="La app lo mostrará automáticamente a partir de esta fecha y hora.">
                  <input
                    type="datetime-local"
                    value={publicarEn}
                    onChange={(e) => setPublicarEn(e.target.value)}
                    className="input"
                  />
                </Field>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-fer-blue hover:bg-fer-blue-dark text-white text-sm font-semibold shadow-sm transition disabled:opacity-50"
          >
            {modo === 'borrador' || editando ? <Save className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            {saving ? 'Guardando…' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  count,
  required,
  children,
}: {
  label: string;
  hint?: string;
  count?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {count && <span className="text-xs text-gray-400">{count}</span>}
      </div>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}


# Contrato panel Web ↔ App Móvil 

El panel y la app **no se hablan directamente**: los dos leen/escriben la misma base de datos
**Cloud Firestore** (proyecto `fer-backend-4d5ba`). Este documento es lo que la app debe respetar
para que lo que publica el panel aparezca bien en los teléfonos.

## 1. Colección `anuncios`

Modelo completo en [`src/types/index.ts`](../src/types/index.ts) (`interface Anuncio`).

| Campo | Tipo | Uso en la app |
|---|---|---|
| `titulo`, `resumen`, `descripcion` | string | Tarjeta y detalle |
| `tags` | string[] | Filtros / chips (HU03, RU06) |
| `isFeatured` | bool | Carrusel "Destacados" del inicio |
| `fecha` | Timestamp | Fecha del evento o del comunicado (se muestra) |
| `autor`, `autorFotoUrl` | string / null | Encabezado del anuncio |
| `imagenPrincipal`, `imagenesSecundarias` | URL / URL[] | Portada y galería (cargar **después** del texto, RNF07) |
| `likes` | int | Contador de likes |
| `audiencias` | `('becarios'｜'aspirantes')[]` | A quién va dirigido |
| `estado` | `'borrador'｜'publicado'｜'archivado'` | La app **solo** muestra `publicado` |
| `prioridad` | `'normal'｜'urgente'` | Badge "Urgente" |
| `publicarEn` | Timestamp | Si es futuro → está **programado**, no mostrar todavía |

## 2. Query que debe usar la app

```text
anuncios
  where estado == "publicado"
  where audiencias array-contains <"becarios" | "aspirantes">
  where publicarEn <= ahora          ← oculta los programados
  orderBy publicarEn desc
  limit 20  (paginar con startAfter para el historial, HU08 / RU03)
```

Ese índice ya existe en [`firestore.indexes.json`](../firestore.indexes.json) (`estado + audiencias + publicarEn`).
Despliégalo con `firebase deploy --only firestore:indexes`.

## 3. Autenticación en la app

- Las reglas exigen `request.auth != null` para leer. Para cumplir **RU01 / HU04** (aspirante sin cuenta),
  la app debe usar **Firebase Anonymous Auth** (`signInAnonymously()`) al abrir.
  → Activarlo en Firebase Console → Authentication → Sign-in method → *Anónimo*.
- Los administradores entran al panel con **email/contraseña**. Las reglas consideran admin a
  cualquiera con proveedor `password`, así que **la app nunca debe usar login con email/contraseña**.

## 4. Likes

La app puede hacer `update` **solo** del campo `likes` con `+1` o `-1` sobre anuncios publicados
(regla `soloLike()`). Usar `increment(1)` / `increment(-1)`.

## 5. Notificaciones push (HU02, RU04, RU07)

Diseño propuesto con **Firebase Cloud Messaging por temas**:

- La app se suscribe a los temas `becarios` o `aspirantes` (y opcionalmente uno por institución, p. ej. `inst_cetys`, para RU06).
- Hoy, al publicar, el panel muestra el ID del anuncio para mandar la campaña desde
  Firebase Console → Messaging con el dato personalizado `anuncioId`. La app abre ese anuncio al tocar la notificación.
- **Siguiente paso (automático):** una Cloud Function `onDocumentWritten('anuncios/{id}')` que mande el push
  cuando `estado` cambia a `publicado`. Requiere el plan Blaze (sigue costando \$0 con este volumen).

## 6. Pendiente por decidir en equipo: métricas de "recibieron / abrieron" (HU05, HU13)

El modelo actual solo tiene `likes`. Para medir aperturas se propone:

1. Agregar `vistas: number` (empieza en 0) a `Anuncio`.
2. La app hace `increment(1)` al abrir el detalle (guardando en local si no hay red, RNF08).
3. Ampliar la regla `soloLike()` para permitir también `vistas +1`.

En cuanto exista `vistas`, el panel puede mostrar la tasa de apertura (`vistas / destinatarios`).
"Recibieron" se puede aproximar con el número de dispositivos suscritos a cada tema.

> [!NOTE]
> Hoy las reglas dejan que cualquier usuario autenticado lea un anuncio `publicado` aunque esté programado
> a futuro. Si se quiere blindar, agregar `&& resource.data.publicarEn <= request.time` a la regla de lectura
> (la query de la app del punto 2 ya cumple con esa condición).


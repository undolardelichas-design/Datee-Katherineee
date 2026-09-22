# AGENTS.md — Datee-Katherineee

Regalo personal: planificador de citas románticas. Todo el contenido visible está en **español** con tono dulce/romántico.

## Comandos

```bash
npm run dev     # Vite en localhost:5173
npm run build   # tsc -b && vite build (typecheck incluido)
npm run lint    # oxlint
```

No hay tests. La verificación es `npm run lint` + `npm run build`.

## Stack (no reemplazar)

- **Vite 8 + React 19 + TypeScript 6** (template react-ts con `verbatimModuleSyntax`: los tipos se importan con `import type`)
- **Tailwind CSS v4** vía plugin `@tailwindcss/vite` en `vite.config.ts` (no hay `tailwind.config.js`; el tema va en `@theme` dentro de `src/index.css`)
- **Firebase 12** — SOLO Firestore (`src/config/firebase.ts`). **Storage de Firebase NO se usa**: los proyectos nuevos requieren plan Blaze; las imágenes van a **Cloudinary** (subida unsigned, `src/services/storage.ts`)
- **GSAP 3.15 + @gsap/react** — todos los plugins premium (DrawSVG, MorphSVG) son gratuitos desde 3.13 y vienen en el paquete npm
- **react-router-dom v7** con rutas en `src/App.tsx`

## Variables de entorno (`.env`, ver `.env.example`)

`VITE_FIREBASE_*` (6), `VITE_APP_PASSWORD` (contraseña de acceso), `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` (preset unsigned `datee-fotos`). Sin `.env` la app compila pero Planner/Detalle muestran estado de error controlado.

## Arquitectura y decisiones no obvias

- **Firestore**: colección `dates`. Cada doc: `categoria, titulo, lugar, descripcion, fechaPlaneada (Timestamp|null), estado ('pendiente'|'completada'), portadaURL, fotos (string[]), createdAt`. Normalización de docs viejos (`imagenURL`) en `normalizeDate()` de `src/types.ts`
- **Cada plan tiene un álbum**: `fotos` es un array de URLs Cloudinary. La Galería (`/gallery`) agrupa por plan (una sección = un álbum). La subida de fotos solo está habilitada cuando `estado === 'completada'` (se marca con botón manual "Marcar como completado", vía `marcarVivido()` — nombre histórico, significa "completar")
- **Portada**: se elige en el wizard `/nuevo` (foto o GIF); si no se sube, default `/gif/ticket.png`. Cambiable después con `updatePortada()` desde el detalle
- **`/nuevo` es un wizard de 5 pasos** (categoría → lugar → fecha opcional → notas → portada) + checklist decorativa de espera (la creación real ocurre ahí) + confirmación + **broma de "pasarela de pago"** con botón "ES BROMAAAA" que navega a `/date/:id`. No "arreglar" la broma: es intencional
- **Acceso**: sin Firebase Auth. Gate con contraseña simple (`src/services/auth.ts`, sessionStorage). Rutas protegidas vía `RequireAuth` en `App.tsx`
- **Fotos/Cloudinary**: subida con `fetch` POST unsigned + `upload_preset`; el archivo se renombra `${tipo}-${dateId}-${ts}-${name}` para public IDs únicos. Borrar imágenes de Cloudinary NO es posible desde el frontend (requeriría API secret firmado) — las fotos quitadas solo salen de Firestore
- Los GIFs decorativos viven en `public/gif/` (uwu, cargando, aura, working, risa, como-que-no, mabel-tiempo-espera, Revisando-fecha). La portada por defecto es `public/gif/ticket.png`

## Convenciones del proyecto

- **Paleta centralizada en `src/theme/garden.ts`** (`gardenColors`): todo el cielo del amanecer, colores de flores del SVG, sol, sparkles, colores de texto/botones. Cambiar esquema de colores = editar solo ese archivo
- **Tipografías**: Cormorant Garamond (serif/itálica, títulos), Quicksand (sans/UI), Caveat (`font-hand`, anotaciones manuscritas de las polaroids). Cargadas en `index.html`
- **Estética**: amanecer pastel (celeste→blanco→lila→rosado), jardín SVG animado con GSAP en `WelcomeScreen` (tallos DrawSVG en cascada, sway infinito, pétalos flotantes, sparkles). El "saltar intro" usa `tlRef.progress(1)` — NO `globalTimeline.clear()` (deja estados inconclusos)
- **Cards de planes completados = polaroids** (clases `.polaroid`, `.washi`, `.sello`, `.polaroid-caption` en `index.css`): rotación alternada, cinta washi, sello postal, letra Caveat. Los planes pendientes usan card estándar
- Las notas/descripción de un plan se muestran SOLO en `DateDetail` (con lightbox para las fotos), nunca en las tarjetas
- Los GIFs PNG/GIF se sirven desde `public/gif/` con rutas absolutas (`/gif/...`)

## Gotchas

- `npm run build` es el único gate de CI local: `tsc` con `verbatimModuleSyntax` falla con imports de tipos sin `type`
- `tsc` también tiene `noUnusedLocals`/`noUnusedParameters`: imports/vars sin usar rompen el build con TS6133 (oxlint solo tiene configurados rules-of-hooks y only-export-components en `.oxlintrc.json`)
- Firestore tiene reglas de prueba abiertas; el acceso "protegido" es solo frontend (sessionStorage). No agregar Firebase Auth sin pedirlo
- La sección "Estructura" del README está desactualizada (menciona `DateForm.tsx`, que no existe); la estructura real está en `src/`
- El usuario trabaja con **modo plan primero y "hazlo" para ejecutar** — presentar plan conciso con archivos tocados y esperar confirmación para cambios grandes
- La fecha/hora del entorno: año 2026, español; `toLocaleDateString('es-ES')` en las fechas visibles

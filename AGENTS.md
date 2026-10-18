# BLOCKWEB — Notas de agente (handoff entre computadoras)

Plataforma web educativa (ES) para aprender HTML, CSS y JS programando con
bloques estilo Scratch + previsualización/publicación estilo WordPress +
certificado PDF con QR verificable.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- Blockly 13 (editor de bloques real, 65 bloques custom ES)
- Supabase (Postgres + Auth + Storage) vía `@supabase/supabase-js` + `@supabase/ssr`
- Certificados: `qrcode` + verificación por RPC `verify_cert`

## Estructura clave

- `src/app/` — `page.tsx` (landing), `dashboard/` (mapa juego), `aprender/[curso]/[leccionId]/` (wizard 5 pasos), `playground/` (Blockly libre), `proyectos/`, `examen/final`, `verify/[code]`, `p/[slug]`, `login/`, `auth/callback/`
- `src/components/` — `LessonEditor.tsx` (wizard), `LessonGate.tsx` (candado secuencia), `MiniEditor.tsx` (VS Code-like), `BlocklyReal.tsx`, `AssetPanel.tsx`, `FilesModal.tsx`, `PreviewModal.tsx`, `StepWizard.tsx`, `AppShell.tsx`
- `src/lib/` — `store.ts` (progreso/XP local + nube), `verification.ts`, `quiz.ts`, `exam.ts` (retos y notas del examen), `assets.ts` (IndexedDB + data URLs), `projects.ts` (publicar), `notice.tsx` (toasts/celebración/peligro), `supabase/` (client/server/session), `blockly/` (blocks, generators, scope, toolbox); `src/middleware.ts` (login obligatorio)
- `src/data/cursos.ts` — 30 lecciones (10 HTML + 10 CSS + 10 JS) con dificultad Facil/Media/Dificil/Boss
- `supabase/schema.sql` — fuente de verdad del schema (re-ejecutable: usa `drop policy if exists`)

## Variables de entorno (NO commitear valores)

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co   # sin "/" final, sin sufijos
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...     # la PUBLICABLE, jamás la secreta
NEXT_PUBLIC_APP_URL=http://localhost:3000            # luego https://blockweb.com
```

`.env.local` (gitignorado) las tiene. `.env.example` es solo plantilla vacía.

## Estado actual

### v1.5 — CERRADA (2026-10-16)
Todo verificado con `npm run build` + `npm run lint` verdes (0 errores).
- **Cursos y camino:** 30 lecciones (10 HTML + 10 CSS + 10 JS) con dificultad Facil/Media/Dificil/Boss; wizard 5 pasos con candado (Aprende→Misión→Lab→Quiz→Boss); dashboard serpiente continua de 30 círculos con banderas por curso + ficha (título, dificultad, XP, empezar); secuencia total (CSS exige HTML, JS exige CSS; lección N exige anteriores) + `LessonGate` anti-URL directa; lección con una sola salida (tira de enfoque → dashboard).
- **Editor bloques:** Blockly real, 42+ bloques ES con alcance por curso (HTML solo-HTML, CSS HTML+CSS, JS todo) + bloques semánticos (`bw_sem`) y de assets (`bw_img_asset`/`bw_video_asset`); generadores HTML/CSS/JS; toolbox filtrada por pestaña (`displayFamily`); anti-zombie en inyección + `svgResize` por `ResizeObserver`; barrido de scrollbar huérfana del flyout; toolbox/scrollbar contenidos en su recuadro; purga de bloques prohibidos.
- **Playground unificado:** un solo editor con toggle 🧱 Bloques / ⌨️ Código (bloques mandan al volver, con modal peligro); `AssetPanel`/`FilesModal` (IndexedDB local, subida 5MB, copy ID/URL); medios servidos como **data URLs** (los `blob:` no cargan en iframes sandbox opacos); preview en `PreviewModal` grande (z-100001, por encima de Blockly); publicar usa el modo activo.
- **Quiz:** paso 3 a pantalla completa (grid 2 col, progreso, barra sticky); aleatorio con seed, 100%, delay anti-spam, solución oculta hasta aprobar.
- **Examen final 3 fases** (gate 100% + 3 Boss): banco 60 preguntas (28 peso doble), Ronda 1 quiz 25q/90%/20min, Ronda 2 reto bloques 90%/15min con imagen subida, Ronda 3 proyecto publicable 90%; nota 40/30/30, +500 XP, medalla por intentos, fases guardadas.
- **Certificado:** PDF/impresión + QR a `/verify/[code]` (RPC `verify_cert` en nube, fallback local); examen exige sesión + elegibilidad.
- **Diseño:** SOLO modo claro (fondo crema `#fff8ec`, sin toggle ni clases `dark` — grep `dark` = 0 en `src`); mundo neobrutalista (bordes gruesos + `block-shadow`, detector impeccable limpio salvo borde estructural aceptado).
- **UI shell:** sidebar fijo independiente (fixed + scroll propio + margen compensado, cierre manual/Esc, botón Entrar para invitados); modo enfoque en lecciones/examen (tira mínima + salir); avisos con diseño (`lib/notice.tsx`: toasts + celebración + peligro; regla eslint `no-alert`).
- **Nube:** Supabase Auth email+Google (login obligatorio vía middleware; `/login`, callback, sesión global, merge local→nube); publish con `user_id` + assets a Storage; RLS + trigger `handle_new_user`; `supabase/schema.sql` re-ejecutable. Bucket `assets` público. Conexión, tablas, RPC y bucket verificados por script.
- ⏳ **Último pendiente operativo:** probar login Google end-to-end en navegador (`/login` → Google → dashboard + fila en `profiles`).

### v2.0 — EN CURSO
- **Fase 1 — Iconos únicos (HECHA):** `src/components/Icon.tsx` (`<Icon name size>`) + `blockIcons.ts` (SVG data-URI en bloques). Emoji de UI/content limpiados; se mantienen los ilustrativos aprobados (grupos 5-7). Bloqui conserva su cara original. Commits `179eb7f`, `01d8982`, `cd08da3`.
- **Fase A — Motor de bloques (HECHA, `8c6f805`):** `generators.ts` recursivo (anida `input_statement`), `generateFromBlocks(getTopBlocks(true))`, `BASE_CSS` en `combineSrcDoc` (sin estilos inline), 16 bloques nuevos. Pestaña "Código generado" (`CodeView`+`hl`) en `MiniEditor`.
- **Fase B — Verificador declarativo (HECHA, `6bb0fce`):** `src/lib/lessonRules.ts` (motor data-only, 2-4 objetivos por lección sobre tags/props JS/CSS); `validateLesson` devuelve `checks`; checklist "Objetivos" en `LessonEditor`. Bloques añadidos para cerrar huecos: `bw_head`, `bw_progress`, `bw_css_sticky`, `bw_js_obj`.
- **Fase C — Starter en bloques (HECHA):** `src/lib/blockly/starter.ts` convierte `codigoInicial`/`bossCodigoRoto` (HTML) a XML de bloques; MiniEditor/BlocklyReal aceptan `starterXml` + `storageSuffix`; el Boss arranca con su propio workspace "roto".
- **Fase D — Cobertura total de bloques (HECHA):** cerrados los huecos que impedían completar misiones. `bw_form` ahora es **contenedor** (`input_statement`); `bw_input` gana `label`+`tipo`(tel/date/color)+`obligatorio` y emite `<label for>`; nuevos `bw_select` y `bw_checkbox`; `id` opcional en `bw_h`/`bw_p`/`bw_div` (js-2/4/5/7/8/9); `bw_table` emite `<th scope="col">`; `bw_head` gana favicon. `starter.ts` convierte formularios a contenedor, asocia `<label for>` a su control y conserva ids. Reglas `html-6`/`html-7` endurecidas; soluciones incompletas corregidas (html-3 tabla, html-10 lista, css-5 sticky, css-10 hover). Verificado con script (reglas de las 30 + XML de starters + round-trip bloques→código) y `build`/`lint` verdes.
- **Fase E — Editor de código unificado (HECHA):** `CodeView` (`src/components/CodeView.tsx`) extraído de `MiniEditor` y compartido. Acepta `editable` + `onChange` (textarea transparente superpuesta al `<pre>` resaltado, scroll sincronizado) para el Playground; `MiniEditor` lo usa en solo-lectura. Playground (pestaña Código) ahora usa las mismas 3 pestañas (`index.html`/`estilos.css`/`logica.js`) con resaltado en vivo y edición; estado `{html,css,js}` en lugar de un `<textarea>` único.
- **Fase F — UI del Playground = lecciones (HECHA):** nueva `src/components/EditorTabBar.tsx` (barra VS Code con pestañas + botón Archivos + contador) compartida por `MiniEditor` y Playground. El Playground ahora usa pestañas `index / estilos / lógica / código` (bloques filtrados por lenguaje con un workspace único persistente; `código` = `CodeView` editable). `scope.ts` gana `getDisplayToolboxAny(family)` y `BlocklyReal` aplica `displayFamily` también sin `curso` (y al inyectar, así el toolbox inicial coincide con la pestaña activa). Se conserva el aviso "código manual" y el diálogo de descarte al salir de `código`.
- **Pendiente:** Fase de contenido (lecciones más largas/claras, diálogos de Bloqui y amigos).
- **Operativo:** probar login Google end-to-end en navegador (`/login` → Google → dashboard + fila en `profiles`).
- **Roadmap restante:** personajes tutores (Bloqui + amigos), lecciones más largas, ampliar catálogo de bloques (features solo en "Extra": flex-wrap, nth-child, colspan/tfoot, radial-gradient, push/filter, class, querySelector, fieldset/legend, og:title, poster).

## Comandos

```bash
npm run dev    # http://localhost:3000
npm run build
npm run lint
```

## Reglas del repo

- Idioma UI: español. Diseño: Bloqui + colores por lenguaje (HTML #FF6B35, CSS #2563EB, JS #FFC700).
- No commitear `.env.local` (cubierto por `.gitignore` vía `.env*`).
- `supabase/schema.sql` debe seguir siendo re-ejecutable (drops antes de creates).

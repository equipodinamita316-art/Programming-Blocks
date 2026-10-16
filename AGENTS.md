# BLOCKWEB — Notas de agente (handoff entre computadoras)

Plataforma web educativa (ES) para aprender HTML, CSS y JS programando con
bloques estilo Scratch + previsualización/publicación estilo WordPress +
certificado PDF con QR verificable.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- Blockly 13 (editor de bloques real, 42 bloques custom ES)
- Supabase (Postgres + Auth + Storage) vía `@supabase/supabase-js` + `@supabase/ssr`
- Certificados: `qrcode` + verificación por RPC `verify_cert`

## Estructura clave

- `src/app/` — `page.tsx` (landing), `dashboard/` (mapa juego), `aprender/[curso]/[leccionId]/` (wizard 5 pasos), `playground/` (Blockly libre), `proyectos/`, `examen/final`, `verify/[code]`, `p/[slug]`, `login/`, `auth/callback/`
- `src/components/` — `LessonEditor.tsx` (wizard), `MiniEditor.tsx` (VS Code-like), `BlocklyReal.tsx`, `AssetPanel.tsx`, `PreviewModal.tsx`, `StepWizard.tsx`, `AppShell.tsx`
- `src/lib/` — `store.ts` (progreso/XP local + nube), `verification.ts`, `quiz.ts`, `assets.ts` (IndexedDB), `projects.ts` (publicar), `supabase/` (client/server/session), `blockly/` (blocks, generators, scope, toolbox)
- `src/data/cursos.ts` — 30 lecciones (10 HTML + 10 CSS + 10 JS) con dificultad Facil/Media/Dificil/Boss
- `supabase/schema.sql` — fuente de verdad del schema (re-ejecutable: usa `drop policy if exists`)

## Variables de entorno (NO commitear valores)

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co   # sin "/" final, sin sufijos
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...     # la PUBLICABLE, jamás la secreta
NEXT_PUBLIC_APP_URL=http://localhost:3000            # luego https://blockweb.com
```

`.env.local` (gitignorado) las tiene. `.env.example` es solo plantilla vacía.

## Estado actual (2026-10-14)

- ✅ 30 lecciones, wizard 5 pasos con candado, Blockly 42 bloques con alcance por curso (HTML solo-HTML, CSS HTML+CSS, JS todo), verificación fuerte con proof, quiz aleatorio, assets IndexedDB + bloques 📁, examen final con gate (80% + 1 Boss), certificado QR, publish Supabase con fallback local, Auth email+Google implementado (login obligatorio vía middleware).
- ✅ Supabase: schema aplicado (6 tablas + `verify_cert`), bucket `assets` público creado, conexión verificada.
- ✅ `npm run build` y `npm run lint` verdes (0 errores).
- ✅ Diseño: SOLO modo claro (fondo crema). Sin toggle ni clases dark. Referencia visual: captura dashboard claro del usuario.
- ⏳ **PENDIENTE — probar login Google end-to-end:** el provider Google ya quedó **activado y verificado por API** (Client ID + Secret en Supabase, redirect URI registrada). Falta: entrar a `/login` → Continuar con Google → verificar que cae en `/dashboard` y que se crea la fila en `profiles` (trigger `handle_new_user`).
- ⏳ Tras eso: probar login Google end-to-end, luego flujo publicar→abrir en incógnito→certificar contra la nube.

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

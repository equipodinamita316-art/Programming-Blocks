import { ALLOW, MIN_BLOCKS, findForbidden } from "./blockly/scope";
import type { Dificultad, Leccion } from "@/data/cursos";

export type ValidationInput = {
  blockTypes: string[];
  html: string;
  css: string;
  js: string;
  quizPassed: boolean;
};

// Lecciones que exigen estructura semántica construible
const SEM_REQUIRED = new Set(["html-4", "html-10"]);
// Bloques JS que cuentan como lógica funcional (var/log solos no bastan)
export const FUNCTIONAL_JS = new Set([
  "bw_js_counter", "bw_js_text", "bw_js_click", "bw_js_if", "bw_js_greet",
  "bw_js_list", "bw_js_validate", "bw_js_save", "bw_js_fetch", "bw_js_level",
  "bw_js_win", "bw_js_timer",
  "bw_js_ifelse", "bw_js_repeat", "bw_js_func", "bw_js_call", "bw_js_onclick", "bw_js_settimeout",
]);

export type ValidationResult = { ok: boolean; errors: string[]; xp: number };

export function validateLesson(leccion: Leccion, input: ValidationInput): ValidationResult {
  const errors: string[] = [];
  const curso = leccion.curso as keyof typeof ALLOW;

  // 1. Alcance estricto (allowlist)
  const forbidden = findForbidden(curso, input.blockTypes);
  if (forbidden.length > 0) {
    errors.push(`Bloques no permitidos en ${leccion.curso.toUpperCase()}: ${forbidden.join(", ")}. Quítalos para completar.`);
  }

  // 2. Mínimos por dificultad
  const min = MIN_BLOCKS[leccion.dificultad as Dificultad] ?? 2;
  const allowedCount = input.blockTypes.filter((t) => ALLOW[curso].has(t)).length;
  if (allowedCount < min) {
    errors.push(`Te faltan bloques: tienes ${allowedCount} válidos, necesitas ${min} mínimo (${leccion.dificultad}).`);
  }

  // 3. Contenido por curso (generado real, no vacío)
  const hasHtml = input.html.replace(/\s/g, "").length > 10;
  const hasCss = input.css.replace(/\s/g, "").length > 5;
  const hasJs = input.js.replace(/\s/g, "").length > 5;
  if (leccion.curso === "html") {
    if (!hasHtml) errors.push("Tu proyecto HTML está vacío. Arrastra al menos 2 bloques de HTML.");
    if (hasCss || hasJs) errors.push("En HTML no debe haber CSS ni JS generados. Revisa tus bloques.");
  } else if (leccion.curso === "css") {
    if (!hasHtml) errors.push("Falta base HTML. Añade al menos 1 bloque de HTML.");
    if (!hasCss) errors.push("Falta estilo CSS. Añade al menos 1 bloque de CSS.");
    if (hasJs) errors.push("En CSS no debe haber JS. Quita los bloques de JS.");
  } else {
    if (!hasHtml) errors.push("Falta HTML base.");
    // JS exige lógica funcional (no basta con HTML o un log)
    const functionalJs = input.blockTypes.filter((t) => FUNCTIONAL_JS.has(t));
    if (functionalJs.length === 0) {
      errors.push("Esta lección JS exige lógica: añade un bloque de JS que use tus elementos (contador, click, condición, guardar, fetch...).");
    }
    if (leccion.dificultad === "Boss" && !hasJs) errors.push("El Boss JS exige lógica: añade bloques de JS.");
  }

  // 3b. Boss exige 1 imagen o video (subido o URL) para publicar con URL
  if (leccion.dificultad === "Boss") {    const hasAssetBlock = input.blockTypes.some((t) => t === "bw_img_asset" || t === "bw_video_asset" || t === "bw_img" || t === "bw_video");
    const hasMediaTag = /<img|<video/i.test(input.html);
    if (!hasAssetBlock || !hasMediaTag) {
      errors.push("El Boss exige 1 imagen o video: súbelo en Mis archivos y úsalo con el bloque de archivos.");
    }
  }

  // 3c. Semántica exigible con bloques construibles
  if (SEM_REQUIRED.has(leccion.id) && !input.blockTypes.includes("bw_sem")) {
    errors.push("Usa al menos 1 bloque de sección (header/nav/main/section/article/footer).");
  }
  // 4. Calidad: URLs e IDs
  const badUrl = /javascript\s*:|data\s*:\s*text\/html/i.test(input.html + input.css + input.js);
  if (badUrl) errors.push("URL peligrosa detectada (javascript:/data:). Cámbiala por https://.");
  const ids = [...input.html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length > 0) errors.push(`IDs duplicados: ${[...new Set(dupes)].join(", ")}. Usa IDs únicos.`);
  const badIds = ids.filter((id) => !/^[A-Za-z][A-Za-z0-9_-]*$/.test(id));
  if (badIds.length > 0) errors.push(`IDs inválidos: ${badIds.join(", ")}. Empieza con letra, sin espacios.`);

  // 5. Quiz obligatorio
  if (!input.quizPassed) errors.push("Aprueba el mini-quiz (100%) para completar.");

  const ok = errors.length === 0;
  return { ok, errors, xp: ok ? leccion.xp : 0 };
}

// Proof ligado a contenido real: id + tipos ordenados + seed + xp de la lección.
// El store lo recalcula antes de otorgar XP; un proof inventado no coincide.
export function proofHash(leccionId: string, blockTypes: string[], quizSeed: number, xp?: number): string {
  const xpPart = xp ?? "";
  const s = `${leccionId}|${[...blockTypes].sort().join(",")}|${quizSeed}|${xpPart}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  }
  return `v2-${(h >>> 0).toString(36)}`;
}

export function verifyProof(leccion: Leccion, blockTypes: string[], quizSeed: number, proof: string): boolean {
  return proof === proofHash(leccion.id, blockTypes, quizSeed, leccion.xp);
}

import type { ExamenPregunta } from "@/data/cursos";
import { shuffleQuiz } from "./quiz";
import { FUNCTIONAL_JS } from "./verification";

// ---------- Selección balanceada: 7 html + 6 css + 6 js + 6 mix = 25 ----------
export function pickQuiz(bank: ExamenPregunta[], seed: number): ExamenPregunta[] {
  const pick = (area: ExamenPregunta["area"], n: number) =>
    shuffleQuiz(
      bank.filter((q) => q.area === area),
      seed + area.length * 7919,
    ).slice(0, n);
  const quiz = [...pick("html", 7), ...pick("css", 6), ...pick("js", 6), ...pick("mix", 6)];
  return shuffleQuiz(quiz, seed);
}

export function quizScore(quiz: ExamenPregunta[], ans: Record<number, number>): number {
  const total = quiz.reduce((s, q) => s + q.peso, 0);
  const got = quiz.reduce((s, q, i) => s + (ans[i] === q.correcta ? q.peso : 0), 0);
  return total === 0 ? 0 : Math.round((got / total) * 100);
}

// ---------- Estado persistente por fase ----------
export type FaseScore = { score: number; extra?: string };

export function getFase(n: 1 | 2 | 3): FaseScore | null {
  try {
    const raw = localStorage.getItem(`bw-exam-f${n}`);
    return raw ? (JSON.parse(raw) as FaseScore) : null;
  } catch {
    return null;
  }
}

export function saveFase(n: 1 | 2 | 3, s: FaseScore) {
  try {
    localStorage.setItem(`bw-exam-f${n}`, JSON.stringify(s));
    window.dispatchEvent(new Event("bw-xp"));
  } catch {}
}

export function getAttempts(): number {
  try {
    return Number(localStorage.getItem("bw-exam-attempts") || 0);
  } catch {
    return 0;
  }
}

export function addAttempt(): number {
  const n = getAttempts() + 1;
  try {
    localStorage.setItem("bw-exam-attempts", String(n));
  } catch {}
  return n;
}

export function medal(attempts: number): { color: string; label: string } {
  if (attempts <= 2) return { color: "#FFC700", label: "Oro" };
  if (attempts <= 4) return { color: "#B7B7C2", label: "Plata" };
  return { color: "#CD7F32", label: "Bronce" };
}

// ---------- Fase 2: retos de bloques ----------
export type Reto = {
  id: string;
  titulo: string;
  brief: string;
  requiredTypes: string[];
  minBlocks: number;
  needCss: boolean;
  needJs: boolean;
  needAsset: boolean;
};

export const RETOS: Reto[] = [
  {
    id: "reto-tarjeta",
    titulo: "Tarjeta gamer que celebra",
    brief: "Título + párrafo + botón con id + imagen TUYA subida en Archivos + fondo con color o degradado. Al hacer clic, el botón celebra.",
    requiredTypes: ["bw_h", "bw_button", "bw_img_asset", "bw_js_click"],
    minBlocks: 5,
    needCss: true,
    needJs: true,
    needAsset: true,
  },
  {
    id: "reto-galeria",
    titulo: "Galería de 3 con grid",
    brief: "Título + imagen TUYA + rejilla de 3 columnas + botón que cambia un texto al hacer clic. Todo con bloques.",
    requiredTypes: ["bw_h", "bw_img_asset", "bw_css_grid3", "bw_js_text"],
    minBlocks: 5,
    needCss: true,
    needJs: true,
    needAsset: true,
  },
  {
    id: "reto-contador",
    titulo: "Contador con estilo",
    brief: "Marcador de puntos + botón que suma de verdad + tarjeta con estilo brutal + tu imagen. El contador debe funcionar al hacer clic.",
    requiredTypes: ["bw_counter_html", "bw_js_counter", "bw_css_card", "bw_img_asset"],
    minBlocks: 5,
    needCss: true,
    needJs: true,
    needAsset: true,
  },
];

export function checkReto(reto: Reto, gen: { types: string[]; html: string; css: string; js: string }): { score: number; missing: string[] } {
  const missing: string[] = [];
  const total = reto.requiredTypes.length + 4;
  let ok = 0;
  for (const t of reto.requiredTypes) {
    if (gen.types.includes(t)) ok++;
    else missing.push(`Falta el bloque ${nombreBloque(t)}`);
  }
  if (gen.types.length >= reto.minBlocks) ok++;
  else missing.push(`Te faltan bloques: ${gen.types.length}/${reto.minBlocks}`);
  const hasCss = gen.css.replace(/\s/g, "").length > 5;
  if (!reto.needCss || hasCss) ok++;
  else missing.push("Falta estilo CSS: agrega un bloque de CSS");
  const hasJs = gen.js.replace(/\s/g, "").length > 5;
  if (!reto.needJs || hasJs) ok++;
  else missing.push("Falta lógica JS: agrega un bloque de JS");
  const hasAsset = gen.types.some((t) => t === "bw_img_asset" || t === "bw_video_asset") && /<img|<video/i.test(gen.html);
  if (!reto.needAsset || hasAsset) ok++;
  else missing.push("Falta tu imagen: súbela en Mis archivos y úsala con el bloque de archivos");
  return { score: Math.round((ok / total) * 100), missing };
}

function nombreBloque(t: string): string {
  const map: Record<string, string> = {
    bw_h: "título (HTML)", bw_p: "párrafo (HTML)", bw_button: "botón (HTML)",
    bw_img_asset: "imagen mía", bw_video_asset: "video mío",
    bw_js_click: "al clic (JS)", bw_js_text: "cambiar texto (JS)",
    bw_js_counter: "contador (JS)", bw_counter_html: "marcador (HTML)",
    bw_css_grid3: "rejilla (CSS)", bw_css_card: "tarjeta (CSS)",
  };
  return map[t] || t;
}

// ---------- Fase 3: proyecto final ----------
export function checkProyecto(gen: { types: string[]; html: string; css: string; js: string }): { score: number; missing: string[] } {
  const missing: string[] = [];
  const checks: [boolean, string][] = [
    [gen.types.includes("bw_sem") && /<(header|nav|main|section|article|footer)[\s>]/i.test(gen.html), "Estructura semántica: usa el bloque de sección (header/nav/main...)"],
    [/@media|bw_css_responsive/.test(gen.css) || gen.types.includes("bw_css_responsive"), "Responsive: agrega el bloque responsive (CSS)"],
    [(gen.html.match(/<img|<video/gi) || []).length >= 3, `Galería: lleva ${(gen.html.match(/<img|<video/gi) || []).length}/3 imágenes o videos`],
    [gen.types.some((t) => FUNCTIONAL_JS.has(t)) && gen.js.replace(/\s/g, "").length > 5, "Interacción JS real que use tus elementos"],
    [!/(^|[^a-zA-Z])alert\s*\(/.test(gen.js.replace(/setTimeout\([^)]*\)/g, "")), "Sin alert al cargar la página"],
    [gen.types.length >= 8, `Suficientes bloques: ${gen.types.length}/8`],
  ];
  let ok = 0;
  for (const [pass, msg] of checks) {
    if (pass) ok++;
    else missing.push(msg);
  }
  return { score: Math.round((ok / checks.length) * 100), missing };
}

export function notaFinal(f1: number, f2: number, f3: number): number {
  return Math.round(f1 * 0.4 + f2 * 0.3 + f3 * 0.3);
}

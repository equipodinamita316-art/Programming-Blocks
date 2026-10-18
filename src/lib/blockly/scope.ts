import { TOOLBOX } from "./toolbox";
import type { CursoSlug } from "../store";

type ToolboxCategory = { kind: string; name?: string; colour?: string; contents: unknown[] };
type Toolbox = { kind: string; contents: ToolboxCategory[] };

function allCategories(): ToolboxCategory[] {
  return TOOLBOX.contents as ToolboxCategory[];
}

export const HTML_TYPES = [
  "bw_h", "bw_p", "bw_a", "bw_img", "bw_button", "bw_input",
  "bw_list", "bw_table", "bw_form", "bw_video", "bw_details", "bw_counter_html",
  "bw_img_asset", "bw_video_asset", "bw_sem",
  "bw_div", "bw_br", "bw_hr", "bw_audio", "bw_iframe",
];

export const CSS_TYPES = [
  "bw_css_color", "bw_css_font", "bw_css_box", "bw_css_card", "bw_css_flex",
  "bw_css_grid3", "bw_css_shadow", "bw_css_gradient", "bw_css_badge",
  "bw_css_hover", "bw_css_center", "bw_css_animate", "bw_css_responsive", "bw_css_dark",
  "bw_css_flex2", "bw_css_grid", "bw_css_transition", "bw_css_transform", "bw_css_media",
];

export const JS_TYPES = [
  "bw_js_var", "bw_js_counter", "bw_js_text", "bw_js_click", "bw_js_if",
  "bw_js_greet", "bw_js_list", "bw_js_validate", "bw_js_save", "bw_js_fetch",
  "bw_js_log", "bw_js_level", "bw_js_win", "bw_js_timer",
  "bw_js_ifelse", "bw_js_repeat", "bw_js_func", "bw_js_call", "bw_js_onclick", "bw_js_settimeout",
];

export const ALLOW: Record<CursoSlug, Set<string>> = {
  html: new Set(HTML_TYPES),
  css: new Set([...HTML_TYPES, ...CSS_TYPES]),
  js: new Set([...HTML_TYPES, ...CSS_TYPES, ...JS_TYPES]),
};

export function getToolboxForCurso(curso: CursoSlug): Toolbox {
  const all = allCategories();
  const cats: ToolboxCategory[] = [all[0]];
  // HTML siempre (es la base)
  if (curso === "css" || curso === "js") cats.push(all[1]);
  if (curso === "js") cats.push(all[2]);
  return { kind: "categoryToolbox", contents: cats };
}

// Toolbox visible por pestaña del MiniEditor (solo cambia lo mostrado, no lo permitido).
export type Family = "html" | "css" | "js";

export function getDisplayToolbox(curso: CursoSlug, family: Family | null): Toolbox {
  if (!family) return getToolboxForCurso(curso);
  const all = allCategories();
  const pick = family === "html" ? [all[0]] : family === "css" ? [all[1]] : [all[2]];
  // Si el curso no incluye esa familia, muestra la completa del curso (no vacía).
  const cursoCats = getToolboxForCurso(curso).contents.length;
  const wanted = family === "html" ? 1 : family === "css" ? 2 : 3;
  if (wanted > cursoCats && family !== "html") return getToolboxForCurso(curso);
  return { kind: "categoryToolbox", contents: pick };
}

export function findForbidden(curso: CursoSlug, types: string[]): string[] {
  const allow = ALLOW[curso];
  return [...new Set(types.filter((t) => !allow.has(t)))];
}

export const MIN_BLOCKS = { Facil: 2, Media: 3, Dificil: 4, Boss: 5 } as const;

"use client";

export type CursoSlug = "html" | "css" | "js";

const XP_KEY = "bw-xp";
const DONE_KEY = "bw-done";
const PROJECTS_KEY = "bw-projects";
const CERTS_KEY = "bw-certs";

export function getXP(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(XP_KEY) || 0);
}

import { LECCIONES } from "@/data/cursos";
import { verifyProof } from "./verification";
import { createClient } from "./supabase/client";

async function userId(): Promise<string | null> {
  try {
    const { data } = await createClient().auth.getUser();
    return data.user?.id || null;
  } catch {
    return null;
  }
}

// Sube un avance verificado a la nube (no bloquea la UI si falla la red).
async function syncDoneToCloud(uid: string, leccionId: string, xp: number) {
  try {
    const sb = createClient();
    await sb.from("progreso_lecciones").upsert(
      { user_id: uid, leccion_id: leccionId, completada: true, xp_ganada: xp },
      { onConflict: "user_id,leccion_id" },
    );
    await sb.from("profiles").update({ xp: getXP(), nivel: getLevel(getXP()) }).eq("id", uid);
  } catch {}
}

function addXPInternal(n: number) {
  if (typeof window === "undefined") return 0;
  const v = getXP() + n;
  localStorage.setItem(XP_KEY, String(v));
  window.dispatchEvent(new Event("bw-xp"));
  return v;
}

export function getDone(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getProof(id: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`bw-proof-${id}`);
}

// Llamada directa bloqueada: completar exige pasar por el verificador.
export function markDone(id: string) {
  if (typeof window === "undefined") return;
  console.warn(`[BLOCKWEB] markDone directo bloqueado para ${id}. Completa la lección con bloques + quiz.`);
}

export function markDoneVerified(id: string, input: { blockTypes: string[]; quizSeed: number; proof: string }): boolean {
  if (typeof window === "undefined") return false;
  const leccion = LECCIONES.find((l) => l.id === id);
  if (!leccion) return false;
  if (!verifyProof(leccion, input.blockTypes, input.quizSeed, input.proof)) {
    console.warn(`[BLOCKWEB] proof inválido para ${id}. Sin XP.`);
    return false;
  }
  const done = new Set(getDone());
  if (!done.has(id)) {
    done.add(id);
    localStorage.setItem(DONE_KEY, JSON.stringify([...done]));
    localStorage.setItem(`bw-proof-${id}`, input.proof);
    localStorage.setItem(`bw-blocks-${id}`, JSON.stringify([...input.blockTypes].sort()));
    addXPInternal(leccion.xp);
    window.dispatchEvent(new Event("bw-xp"));
    void userId().then((uid) => {
      if (uid) void syncDoneToCloud(uid, id, leccion.xp);
    });
  }
  return true;
}

// Fusiona el avance local a la cuenta una sola vez por usuario.
export async function mergeLocalToCloud(): Promise<{ merged: number; already: boolean }> {
  const uid = await userId();
  if (!uid) return { merged: 0, already: false };
  if (typeof window !== "undefined" && localStorage.getItem(`bw-merged-${uid}`) === "1") {
    return { merged: 0, already: true };
  }
  const done = getDone();
  let merged = 0;
  try {
    const sb = createClient();
    // 1. Baja lo de la nube y une con lo local (por si entras en otro dispositivo)
    const { data: cloud } = await sb.from("progreso_lecciones").select("leccion_id").eq("user_id", uid);
    const cloudIds = ((cloud as { leccion_id: string }[] | null) || []).map((r) => r.leccion_id);
    const union = new Set([...done, ...cloudIds.filter((id) => LECCIONES.some((l) => l.id === id))]);
    localStorage.setItem(DONE_KEY, JSON.stringify([...union]));
    window.dispatchEvent(new Event("bw-xp"));
    // 2. Sube lo local que falte en la nube (ya fue validado al ganarse; fusión única)
    for (const id of union) {
      const leccion = LECCIONES.find((l) => l.id === id);
      if (!leccion) continue;
      await sb.from("progreso_lecciones").upsert(
        { user_id: uid, leccion_id: id, completada: true, xp_ganada: leccion.xp },
        { onConflict: "user_id,leccion_id" },
      );
      merged++;
    }
    // XP nube = máximo entre local y nube (nunca se pierde avance)
    const { data } = await sb.from("profiles").select("xp").eq("id", uid).limit(1).single();
    const cloudXp = (data as { xp: number } | null)?.xp || 0;
    const xp = Math.max(getXP(), cloudXp);
    await sb.from("profiles").update({ xp, nivel: getLevel(xp) }).eq("id", uid);
    localStorage.setItem(`bw-merged-${uid}`, "1");
  } catch {}
  return { merged, already: false };
}

// Elegibilidad examen final: 100% lecciones + los 3 Boss publicados (uno por curso).
export function getEligibility(): { done: number; total: number; pct: number; bossProjects: number; eligible: boolean } {
  const done = getDone();
  const total = LECCIONES.length;
  const pct = total === 0 ? 0 : Math.round((done.length / total) * 100);
  const slugs = getProjects().map((p) => p.slug);
  const bossProjects = ["html-10", "css-10", "js-10"].filter((b) => slugs.some((s) => s.includes(b))).length;
  return { done: done.length, total, pct, bossProjects, eligible: done.length === total && bossProjects >= 3 };
}

// Orden del camino: cada curso exige el anterior al 100%.
const COURSE_ORDER = ["html", "css", "js"] as const;

// Progreso por curso para el candado del dashboard.
export function getCourseProgress(): { slug: string; done: number; total: number; complete: boolean }[] {
  const done = new Set(getDone());
  return ["html", "css", "js"].map((slug) => {
    const ls = LECCIONES.filter((l) => l.curso === slug);
    const n = ls.filter((l) => done.has(l.id)).length;
    return { slug, done: n, total: ls.length, complete: n === ls.length };
  });
}

// ¿Curso desbloqueado? El primero siempre; los demás exigen el anterior completo.
export function isCourseUnlocked(slug: string): boolean {
  const i = COURSE_ORDER.indexOf(slug as (typeof COURSE_ORDER)[number]);
  if (i <= 0) return true;
  const done = new Set(getDone());
  const prev = LECCIONES.filter((l) => l.curso === COURSE_ORDER[i - 1]);
  return prev.every((l) => done.has(l.id));
}

// Primera lección pendiente del curso (o la primera si está completo, para repasar).
export function nextPendingLesson(slug: string): string | null {
  const ls = LECCIONES.filter((l) => l.curso === slug).sort((a, b) => a.orden - b.orden);
  if (ls.length === 0) return null;
  const done = new Set(getDone());
  return (ls.find((l) => !done.has(l.id)) || ls[0]).id;
}

// ¿Lección desbloqueada? Curso abierto + todas las anteriores del curso hechas.
export function isLessonUnlocked(id: string): boolean {
  const l = LECCIONES.find((x) => x.id === id);
  if (!l) return false;
  if (!isCourseUnlocked(l.curso)) return false;
  const done = new Set(getDone());
  return LECCIONES.filter((x) => x.curso === l.curso && x.orden < l.orden).every((x) => done.has(x.id));
}

// Lección anterior pendiente (para la pantalla de candado).
export function prevPendingLesson(id: string): string | null {
  const l = LECCIONES.find((x) => x.id === id);
  if (!l) return null;
  const done = new Set(getDone());
  const prev = LECCIONES.filter((x) => x.curso === l.curso && x.orden < l.orden && !done.has(x.id)).sort((a, b) => a.orden - b.orden);
  return prev.length > 0 ? prev[0].id : null;
}

// Examen solo otorga certificado si hay elegibilidad (se verifica al corregir).
export function awardExam(noun: string): boolean {
  void noun;
  const { eligible } = getEligibility();
  if (!eligible) return false;
  if (typeof window === "undefined") return false;
  if (localStorage.getItem("bw-exam-xp") === "1") return true;
  localStorage.setItem("bw-exam-xp", "1");
  addXPInternal(500);
  window.dispatchEvent(new Event("bw-xp"));
  return true;
}

export function isDone(id: string) {
  return getDone().includes(id);
}

export function getLevel(xp: number) {
  if (xp >= 1200) return "Maestro Blockweb";
  if (xp >= 700) return "Hacker Web";
  if (xp >= 300) return "Constructor";
  return "Novato Bloque";
}

export type LocalProject = {
  slug: string;
  nombre: string;
  html: string;
  fecha: string;
};

export function getProjects(): LocalProject[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveProject(p: LocalProject) {
  if (typeof window === "undefined") return;
  const all = [p, ...getProjects()].slice(0, 30);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(all));
}

export type LocalCert = { codigo: string; nombre: string; nota: number; fecha: string };

export function getCerts(): LocalCert[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CERTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCert(c: LocalCert) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CERTS_KEY, JSON.stringify([c, ...getCerts()]));
}

export function findCert(codigo: string): LocalCert | null {
  return getCerts().find((c) => c.codigo.toLowerCase() === codigo.toLowerCase()) || null;
}

// Guarda el certificado también en la nube (para verify_cert). No bloquea si falla.
export async function saveCertCloud(codigo: string, nota: number): Promise<boolean> {
  try {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return false;
    const { error } = await sb.from("certificados").insert({
      user_id: user.id,
      codigo_unico: codigo,
      nota,
    });
    return !error;
  } catch {
    return false;
  }
}

export function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

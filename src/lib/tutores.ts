import type { CursoSlug } from "./store";
import type { Leccion } from "@/data/cursos";

export type TutorId =
  | "bloqui"
  | "blady"
  | "rocket"
  | "baggy"
  | "blilie"
  | "beny";

export type Tutor = {
  nombre: string;
  color: string;
  rol: string;
  avatar: string;
};

export const TUTORES: Record<TutorId, Tutor> = {
  bloqui: {
    nombre: "Bloqui",
    color: "#a16207",
    rol: "Guía general",
    avatar: "/blokis/web/bloqui.png",
  },
  blady: {
    nombre: "Blady",
    color: "#15803d",
    rol: "Tutor de HTML",
    avatar: "/blokis/web/blady.png",
  },
  rocket: {
    nombre: "Rocket",
    color: "#c2410c",
    rol: "Tutor de JavaScript",
    avatar: "/blokis/web/rocket.png",
  },
  baggy: {
    nombre: "Baggy",
    color: "#6d28d9",
    rol: "Tutor de CSS",
    avatar: "/blokis/web/baggy.png",
  },
  blilie: {
    nombre: "Blilie",
    color: "#be185d",
    rol: "Retos y quiz",
    avatar: "/blokis/web/blilie.png",
  },
  beny: {
    nombre: "Beny",
    color: "#1d4ed8",
    rol: "Jefe final",
    avatar: "/blokis/web/beny.png",
  },
};

export const TUTOR_POR_CURSO: Record<CursoSlug, TutorId> = {
  html: "blady",
  css: "baggy",
  js: "rocket",
};

export const TUTOR_BOSS: TutorId = "beny";

const NOMBRE_CURSO: Record<CursoSlug, string> = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
};

export function tutorDelCurso(curso: CursoSlug): TutorId {
  return TUTOR_POR_CURSO[curso];
}

export function textoIntro(l: Leccion): string {
  if (l.tutor?.intro) return l.tutor.intro;
  const t = TUTORES[TUTOR_POR_CURSO[l.curso]];
  return `¡Hola! Soy ${t.nombre}, tu guía de ${NOMBRE_CURSO[l.curso]}. Hoy toca «${l.titulo}». Lee los pasos, mira el ejemplo y luego constrúyelo tú.`;
}

export function textoPista(l: Leccion): string {
  if (l.tutor?.pista) return l.tutor.pista;
  return (
    l.pistas[0] ??
    "Prueba tu proyecto con el botón Probar antes de avanzar."
  );
}

export function textoBoss(l: Leccion): string {
  if (l.tutor?.boss) return l.tutor.boss;
  return `¡Último reto de ${NOMBRE_CURSO[l.curso]}! Revisa los objetivos, usa tu imagen o video y pulsa Publicar. ¡Vas a lograrlo!`;
}

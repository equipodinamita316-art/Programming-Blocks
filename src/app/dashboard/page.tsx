"use client";

import Link from "next/link";
import { CURSOS, LECCIONES, DIFICULTAD_META } from "@/data/cursos";
import {
  getDone, getCourseProgress, isCourseUnlocked, nextPendingLesson, mergeLocalToCloud,
} from "@/lib/store";
import { useSession } from "@/lib/supabase/session";
import { useEffect, useState } from "react";
import { Bloqui } from "@/components/Bloqui";

export default function Dashboard() {
  const [done, setDone] = useState<string[]>(() => getDone());
  const [mergeMsg, setMergeMsg] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { user } = useSession();
  useEffect(() => {
    const h = () => setDone(getDone());
    window.addEventListener("bw-xp", h);
    return () => window.removeEventListener("bw-xp", h);
  }, []);
  useEffect(() => {
    if (!user) return;
    mergeLocalToCloud().then(({ merged, already }) => {
      if (merged > 0 && !already) {
        setDone(getDone());
        setMergeMsg(`☁️ Avance fusionado a tu cuenta: ${merged} lecciones.`);
      }
    }).catch(() => {});
  }, [user]);

  const courses = getCourseProgress();
  const examOpen = courses.every((c) => c.complete);
  const current = courses.find((c) => !c.complete && isCourseUnlocked(c.slug))?.slug
    || courses.find((c) => !c.complete)?.slug
    || "html";
  // Curso mostrado: el elegido, o el actual por defecto (derivado, sin efecto)
  const shown = expanded ?? current;

  const toggle = (slug: string, unlocked: boolean) => {
    if (!unlocked) return;
    setExpanded((e) => (e === slug ? null : slug));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Bloqui mood={examOpen ? "wow" : "happy"} size={52} />
        <div>
          <h1 className="font-display text-3xl font-extrabold">Camino Blockweb 🗺️</h1>
          <p className="text-sm opacity-70">Un curso abre el siguiente · {done.length}/{LECCIONES.length} lecciones</p>
          {mergeMsg && <p className="text-xs font-bold text-green-700">{mergeMsg}</p>}
        </div>
      </div>

      {/* Camino de niveles */}
      <div className="relative flex flex-col gap-2 py-2">
        {/* Línea conectora */}
        <div aria-hidden className="absolute left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 rounded bg-[#1a1523]/15 dark:bg-white/15" />

        {CURSOS.map((c, i) => {
          const prog = courses.find((p) => p.slug === c.slug)!;
          const unlocked = isCourseUnlocked(c.slug);
          const isCurrent = c.slug === current && !prog.complete;
          const lessons = LECCIONES.filter((l) => l.curso === c.slug);
          const totalXp = lessons.reduce((s, l) => s + l.xp, 0);
          const diffCount: Record<string, number> = {};
          lessons.forEach((l) => { diffCount[l.dificultad] = (diffCount[l.dificultad] || 0) + 1; });
          const pending = nextPendingLesson(c.slug);
          const side = i % 2 === 0 ? "md:self-start" : "md:self-end";
          const isOpen = shown === c.slug;

          return (
            <div key={c.slug} className={`relative flex flex-col items-center gap-2 md:w-[46%] ${side}`}>
              {/* Nodo círculo */}
              <button
                onClick={() => toggle(c.slug, unlocked)}
                disabled={!unlocked}
                aria-label={unlocked ? `Abrir curso ${c.titulo}` : `${c.titulo} bloqueado`}
                className={`relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex flex-col items-center justify-center font-display font-extrabold block-shadow ${
                  !unlocked
                    ? "bg-black/10 dark:bg-white/10 border-dashed border-[#1a1523]/40 opacity-70 cursor-not-allowed"
                    : prog.complete
                      ? "bg-green-500 text-white border-[#1a1523]"
                      : "text-white border-[#1a1523]"
                } ${isCurrent && unlocked ? "animate-pulse ring-4 ring-[#FFC700]" : ""}`}
                style={unlocked && !prog.complete ? { background: c.color } : undefined}
              >
                <span className="text-2xl md:text-3xl">{!unlocked ? "🔒" : prog.complete ? "✅" : c.emoji}</span>
                <span className="text-[11px] md:text-xs leading-none">{!unlocked ? `${prog.done}/${prog.total}` : prog.complete ? "10/10" : `Nivel ${i + 1}`}</span>
              </button>
              <div className="z-10 rounded-full bg-[var(--background)] border-2 border-[#1a1523]/20 px-3 py-0.5 text-xs font-extrabold">
                {c.titulo} · {prog.done}/{prog.total}
              </div>
              {!unlocked && (
                <p className="text-xs font-bold opacity-70">🔒 Termina {CURSOS[i - 1]?.titulo} primero</p>
              )}

              {/* Caja expandible: solo info + empezar */}
              {isOpen && unlocked && (
                <div className="z-10 w-full max-w-[420px] rounded-3xl border-4 border-[#1a1523] dark:border-white/20 bg-white dark:bg-white/5 p-4 block-shadow">
                  <p className="text-sm opacity-80">{c.descripcion}</p>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${(prog.done / prog.total) * 100}%`, background: c.color }} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1 text-xs font-bold">
                    {Object.entries(diffCount).map(([d, n]) => {
                      const meta = DIFICULTAD_META[d as keyof typeof DIFICULTAD_META];
                      return (
                        <span key={d} className="rounded-full px-2 py-0.5 border" style={{ borderColor: meta.color, color: meta.color }}>
                          {meta.emoji}×{n}
                        </span>
                      );
                    })}
                    <span className="rounded-full px-2 py-0.5 bg-black/5 dark:bg-white/10">⚡ {totalXp} XP</span>
                  </div>
                  {pending && (
                    <Link
                      href={`/aprender/${c.slug}/${pending}`}
                      className="mt-3 block rounded-2xl text-white text-center font-extrabold px-4 py-3"
                      style={{ background: c.color }}
                    >
                      {prog.complete ? "🔁 Repasar curso" : prog.done === 0 ? "▶️ Empezar curso" : "▶️ Continuar curso"}
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Castillo final: examen */}
        <div className="relative flex flex-col items-center gap-2">
          <div
            className={`relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex flex-col items-center justify-center font-display font-extrabold ${
              examOpen ? "bg-[#FF6B35] text-white border-[#1a1523] animate-pulse ring-4 ring-[#FFC700]" : "bg-black/10 dark:bg-white/10 border-dashed border-[#1a1523]/40 opacity-70"
            }`}
          >
            <span className="text-2xl md:text-3xl">{examOpen ? "🏰" : "🔒"}</span>
            <span className="text-[11px] md:text-xs leading-none">Final</span>
          </div>
          {examOpen ? (
            <Link href="/examen/final" className="z-10 rounded-2xl bg-[#FF6B35] text-white font-extrabold px-6 py-3 block-shadow-sm">👹 Examen final</Link>
          ) : (
            <p className="text-xs font-bold opacity-70">🔒 Completa los 3 cursos para el examen</p>
          )}
        </div>
      </div>
    </div>
  );
}

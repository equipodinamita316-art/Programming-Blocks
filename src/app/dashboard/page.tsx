"use client";

import Link from "next/link";
import { CURSOS, LECCIONES, DIFICULTAD_META } from "@/data/cursos";
import {
  getDone, getCourseProgress, isLessonUnlocked, prevPendingLesson, mergeLocalToCloud,
} from "@/lib/store";
import { useSession } from "@/lib/supabase/session";
import { useEffect, useState } from "react";
import { Bloqui } from "@/components/Bloqui";

const ORDER = ["html", "css", "js"] as const;

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
  const doneSet = new Set(done);

  // Camino plano: 30 lecciones en orden curso → orden
  const path = ORDER.flatMap((slug) =>
    LECCIONES.filter((l) => l.curso === slug).sort((a, b) => a.orden - b.orden),
  );
  const currentId = path.find((l) => isLessonUnlocked(l.id) && !doneSet.has(l.id))?.id || null;
  // Ficha mostrada: la elegida, o la actual por defecto (derivado, sin efecto)
  const shownId = expanded ?? currentId;
  const shown = path.find((l) => l.id === shownId && isLessonUnlocked(l.id)) || null;

  const toggle = (id: string) => {
    if (!isLessonUnlocked(id)) return;
    setExpanded((e) => (e === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Bloqui mood={examOpen ? "wow" : "happy"} size={52} />
        <div>
          <h1 className="font-display text-3xl font-extrabold">Camino Blockweb 🗺️</h1>
          <p className="text-sm opacity-70">30 niveles en orden · {done.length}/{LECCIONES.length} lecciones</p>
          {mergeMsg && <p className="text-xs font-bold text-green-700">{mergeMsg}</p>}
        </div>
      </div>

      {/* Serpiente continua de 30 */}
      <div className="relative flex flex-col py-2">
        {/* Línea conectora */}
        <div aria-hidden className="absolute left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 rounded bg-[#1a1523]/15 dark:bg-white/15" />

        {path.map((l, i) => {
          const curso = CURSOS.find((c) => c.slug === l.curso)!;
          const meta = DIFICULTAD_META[l.dificultad];
          const d = doneSet.has(l.id);
          const unlocked = isLessonUnlocked(l.id);
          const isCurrent = l.id === currentId && !d;
          const isBoss = l.dificultad === "Boss";
          const banner = i === 0 || path[i - 1].curso !== l.curso;
          const side = i % 2 === 0 ? "md:self-start" : "md:self-end";
          const isOpen = shown?.id === l.id;

          return (
            <div key={l.id} className="relative flex flex-col items-center">
              {/* Bandera de zona */}
              {banner && (
                <div className="z-10 my-3 rounded-2xl border-4 border-[#1a1523] dark:border-white/20 px-5 py-1.5 font-display text-lg font-extrabold text-white block-shadow-sm" style={{ background: curso.color }}>
                  {curso.emoji} {curso.titulo}
                </div>
              )}

              <div className={`relative flex flex-col items-center gap-1.5 md:w-[46%] ${side} py-1`}>
                {/* Círculo de la lección */}
                <button
                  onClick={() => toggle(l.id)}
                  disabled={!unlocked}
                  aria-label={unlocked ? `Abrir lección ${l.titulo}` : `Lección bloqueada: ${l.titulo}`}
                  className={`relative z-10 rounded-full border-4 flex flex-col items-center justify-center font-display font-extrabold block-shadow-sm ${
                    isBoss ? "w-20 h-20 md:w-24 md:h-24" : "w-16 h-16 md:w-20 md:h-20"
                  } ${
                    !unlocked
                      ? "bg-black/10 dark:bg-white/10 border-dashed border-[#1a1523]/40 opacity-70 cursor-not-allowed"
                      : d
                        ? "bg-green-500 text-white border-[#1a1523]"
                        : "text-white border-[#1a1523]"
                  } ${isCurrent ? "animate-pulse ring-4 ring-[#FFC700]" : ""}`}
                  style={unlocked && !d ? { background: curso.color } : undefined}
                >
                  <span className="text-xl md:text-2xl">{!unlocked ? "🔒" : d ? "✅" : isBoss ? "👹" : l.orden}</span>
                  <span className="text-[10px] md:text-[11px] leading-none">Nv {i + 1}</span>
                </button>

                {!unlocked && (
                  <p className="text-[11px] font-bold opacity-70 text-center">
                    🔒 {(() => {
                      const prev = prevPendingLesson(l.id);
                      const pl = LECCIONES.find((x) => x.id === prev);
                      return prev && pl ? `Completa "${pl.titulo}"` : `Termina el curso anterior`;
                    })()}
                  </p>
                )}

                {/* Ficha: título + dificultad + XP + empezar */}
                {isOpen && (
                  <div className="z-10 w-full max-w-[420px] rounded-3xl border-4 border-[#1a1523] dark:border-white/20 bg-white dark:bg-white/5 p-4 block-shadow">
                    <div className="font-display text-lg font-extrabold leading-tight">{l.titulo}</div>
                    <div className="mt-2 flex flex-wrap gap-1 text-xs font-bold">
                      <span className="rounded-full px-2 py-0.5 border" style={{ borderColor: meta.color, color: meta.color }}>
                        {meta.emoji} {meta.label}
                      </span>
                      <span className="rounded-full px-2 py-0.5 bg-black/5 dark:bg-white/10">⚡ +{l.xp} XP</span>
                      <span className="rounded-full px-2 py-0.5 bg-black/5 dark:bg-white/10">Nivel {i + 1}/30</span>
                    </div>
                    <div className="mt-1 text-xs opacity-70">📖 Misión · 🎨 Lab · 👹 Boss · ✅ Quiz</div>
                    <Link
                      href={`/aprender/${l.curso}/${l.id}`}
                      className="mt-3 block rounded-2xl text-white text-center font-extrabold px-4 py-3"
                      style={{ background: curso.color }}
                    >
                      {d ? "🔁 Repasar lección" : isCurrent ? "▶️ Empezar lección" : "▶️ Continuar lección"}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Castillo final: examen */}
        <div className="relative flex flex-col items-center gap-2 mt-2">
          <div
            className={`relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex flex-col items-center justify-center font-display font-extrabold ${
              examOpen ? "bg-[#FF6B35] text-white border-[#1a1523] animate-pulse ring-4 ring-[#FFC700]" : "bg-black/10 dark:bg-white/10 border-dashed border-[#1a1523]/40 opacity-70"
            }`}
          >
            <span className="text-2xl md:text-3xl">{examOpen ? "🏰" : "🔒"}</span>
            <span className="text-[10px] md:text-[11px] leading-none">Final</span>
          </div>
          {examOpen ? (
            <Link href="/examen/final" className="z-10 rounded-2xl bg-[#FF6B35] text-white font-extrabold px-6 py-3 block-shadow-sm">👹 Examen final</Link>
          ) : (
            <p className="text-xs font-bold opacity-70">🔒 Completa las 30 lecciones para el examen</p>
          )}
        </div>
      </div>
    </div>
  );
}

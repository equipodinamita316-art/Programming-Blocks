"use client";

import Link from "next/link";
import { CURSOS, LECCIONES, DIFICULTAD_META } from "@/data/cursos";
import { getDone, mergeLocalToCloud } from "@/lib/store";
import { useSession } from "@/lib/supabase/session";
import { useEffect, useState } from "react";
import { Bloqui } from "@/components/Bloqui";

export default function Dashboard() {
  const [done, setDone] = useState<string[]>(() => getDone());
  const [mergeMsg, setMergeMsg] = useState("");
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Bloqui mood="happy" size={52} />
        <div>
          <h1 className="font-display text-3xl font-extrabold">Mapa de aprendizaje</h1>
          <p className="text-sm opacity-70">Completa nodos para desbloquear el examen final · {done.length}/{LECCIONES.length} lecciones</p>
          {mergeMsg && <p className="text-xs font-bold text-green-700">{mergeMsg}</p>}
        </div>
        <Link href="/examen/final" className="ml-auto rounded-2xl bg-[#FF6B35] text-white font-extrabold px-4 py-2 block-shadow-sm">👹 Examen final</Link>
      </div>

      {CURSOS.map((c) => (
        <section key={c.slug} className="rounded-3xl border-4 border-[#1a1523] dark:border-white/20 p-4 bg-white dark:bg-white/5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{c.emoji}</span>
            <h2 className="font-display text-2xl font-extrabold" style={{ color: c.color }}>{c.titulo}</h2>
            <span className="text-sm opacity-70 ml-2">{c.descripcion}</span>
          </div>
          {/* Ruta serpenteante */}
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:flex-wrap">
            {LECCIONES.filter((l) => l.curso === c.slug).map((l) => {
              const d = done.includes(l.id);
              const meta = DIFICULTAD_META[l.dificultad];
              const isBoss = l.dificultad === "Boss";
              // Boss se bloquea hasta completar 60% del curso
              const cursoLessons = LECCIONES.filter((x) => x.curso === c.slug);
              const doneInCurso = cursoLessons.filter((x) => done.includes(x.id)).length;
              const locked = isBoss && doneInCurso < 6;
              return (
                <div
                  key={l.id}
                  className={`flex-1 min-w-[240px] rounded-2xl border-4 p-4 block-shadow-sm ${d ? "border-green-500 bg-green-50 dark:bg-green-950" : locked ? "opacity-60 border-dashed border-[#1a1523] dark:border-white/20" : "border-[#1a1523] dark:border-white/20 bg-[var(--background)]"}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-extrabold text-white shrink-0" style={{ background: c.color }}>{l.orden}</div>
                    <div className="font-extrabold leading-tight">{l.titulo}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1 text-xs font-bold">
                    <span className="rounded-full px-2 py-0.5 border" style={{ borderColor: meta.color, color: meta.color }}>{meta.emoji} {meta.label}</span>
                    <span className="rounded-full px-2 py-0.5 bg-black/5 dark:bg-white/10">+{l.xp} XP</span>
                  </div>
                  <div className="mt-1 text-xs opacity-70">📖 Misión · 🎨 Lab · 👹 Boss · ✅ Quiz</div>
                  <div className="mt-2">
                    {d ? (
                      <Link href={`/aprender/${l.curso}/${l.id}`} className="text-sm font-bold text-green-600">✅ Completada · Repasar →</Link>
                    ) : locked ? (
                      <div className="text-sm font-bold">🔒 Boss bloqueado · completa {6 - doneInCurso} más ({doneInCurso}/6)</div>
                    ) : (
                      <Link href={`/aprender/${l.curso}/${l.id}`} className="inline-block rounded-xl bg-[#1a1523] text-white dark:bg-white dark:text-black text-sm font-bold px-3 py-1">▶️ Jugar</Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

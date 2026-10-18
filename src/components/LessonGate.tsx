"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LECCIONES } from "@/data/cursos";
import {
  isCourseUnlocked,
  isLessonUnlocked,
  nextPendingLesson,
  prevPendingLesson,
} from "@/lib/store";
import { Bloqui } from "./Bloqui";
import { Icon } from "./Icon";

// Puerta del camino: las lecciones se abren en orden. Si entran por URL directa
// a una bloqueada, muestra candado (no redirect silencioso).
export function LessonGate({
  leccionId,
  curso,
  children,
}: {
  leccionId: string;
  curso: string;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(true);
  const [prev, setPrev] = useState<string | null>(null);
  const [mine, setMine] = useState<string | null>(null);
  const [courseOpen, setCourseOpen] = useState(true);

  useEffect(() => {
    const sync = () => {
      setOpen(isLessonUnlocked(leccionId));
      setPrev(prevPendingLesson(leccionId));
      setCourseOpen(isCourseUnlocked(curso));
      setMine(nextPendingLesson(curso));
      setReady(true);
    };
    sync();
    window.addEventListener("bw-xp", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("bw-xp", sync);
      window.removeEventListener("storage", sync);
    };
  }, [leccionId, curso]);

  if (!ready)
    return (
      <p className="flex items-center gap-2 font-bold">
        <Icon name="hourglass" size={16} />
        Abriendo camino...
      </p>
    );
  if (open) return <>{children}</>;

  const prevLesson = LECCIONES.find((l) => l.id === prev);
  return (
    <div className="mx-auto max-w-[480px] rounded-3xl border-4 border-[#1a1523] bg-white p-6 text-center block-shadow">
      <Bloqui mood="think" size={64} />
      <h1 className="mt-2 flex items-center justify-center gap-2 font-display text-2xl font-extrabold">
        <Icon name="lock" size={22} />
        Camino bloqueado
      </h1>
      <p className="text-sm mt-2 opacity-80">
        {!courseOpen ? (
          "Este curso aún no se abre. Termina el anterior primero."
        ) : prevLesson ? (
          <>
            Completa primero <b>{prevLesson.titulo}</b> para seguir.
          </>
        ) : (
          "Completa las lecciones anteriores para seguir."
        )}
      </p>
      {mine && courseOpen ? (
        <Link
          href={`/aprender/${curso}/${mine}`}
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#1a1523] text-white font-extrabold px-4 py-3"
        >
          <Icon name="play" size={16} />
          Ir a mi lección actual
        </Link>
      ) : (
        <Link
          href="/dashboard"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#1a1523] text-white font-extrabold px-4 py-3"
        >
          <Icon name="map" size={16} />
          Volver al camino
        </Link>
      )}
    </div>
  );
}

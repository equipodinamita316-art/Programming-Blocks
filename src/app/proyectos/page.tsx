"use client";

import { PLANTILLAS } from "@/data/cursos";
import { getProjects, saveProject } from "@/lib/store";
import { useNotice } from "@/lib/notice";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";

export default function Proyectos() {
  const { notify } = useNotice();
  const [mine, setMine] = useState<{ slug: string; nombre: string }[]>(() =>
    getProjects(),
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold">
        <Icon name="palette" size={28} />
        Plantillas estilo WordPress
      </h1>
      <p className="text-sm opacity-70">
        Elige una, personalízala en el Playground y publícala.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {PLANTILLAS.map((p) => (
          <div
            key={p.slug}
            className="rounded-3xl border-4 border-[#1a1523] bg-white overflow-hidden block-shadow"
          >
            <div className="h-[160px] overflow-hidden bg-white border-b-2">
              <iframe
                title={p.slug}
                sandbox=""
                srcDoc={p.html}
                className="w-full h-full pointer-events-none"
              />
            </div>
            <div className="p-4">
              <div className="font-display font-extrabold">{p.nombre}</div>
              <div className="text-sm opacity-70">{p.desc}</div>
              <div className="mt-2 flex gap-2">
                <Link
                  href={`/p/${p.slug}`}
                  className="flex-1 text-center rounded-xl border-2 font-bold py-1 text-sm"
                >
                  Ver
                </Link>
                <button
                  onClick={() => {
                    const slug = `${p.slug}-${Math.random().toString(36).slice(2, 6)}`;
                    saveProject({
                      slug,
                      nombre: p.nombre,
                      html: p.html,
                      fecha: new Date().toISOString(),
                    });
                    setMine(getProjects());
                    notify("Plantilla clonada a Mis proyectos", "exito", {
                      label: "Ver",
                      href: `/p/${slug}`,
                    });
                  }}
                  className="flex-1 rounded-xl bg-[#1a1523] text-white font-bold py-1 text-sm"
                >
                  Usar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <h2 className="font-display text-xl font-extrabold mt-2">
        Mis proyectos publicados ({mine.length})
      </h2>
      {mine.length === 0 ? (
        <p className="flex items-center gap-1.5 text-sm opacity-70">
          Aún no publicas. Ve al Playground
          <Icon name="blocks" size={15} />
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-2">
          {mine.map((m) => (
            <Link
              key={m.slug}
              href={`/p/${m.slug}`}
              className="flex items-center gap-1.5 rounded-xl border-2 p-3 font-bold text-sm underline"
            >
              <Icon name="globe" size={15} />
              {m.nombre} · /p/{m.slug}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getProjects } from "@/lib/store";
import { fetchSharedProject } from "@/lib/projects";
import { Icon } from "@/components/Icon";

export function LocalView({ slug }: { slug: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  useEffect(() => {
    let live = true;
    (async () => {
      const remote = await fetchSharedProject(slug);
      if (!live) return;
      if (remote) {
        setHtml(remote);
        setShared(true);
        return;
      }
      const p = getProjects().find((x) => x.slug === slug);
      if (live) setHtml(p ? p.html : null);
    })();
    return () => {
      live = false;
    };
  }, [slug]);
  if (html === null)
    return (
      <p className="text-sm opacity-70">
        Buscando proyecto... (nube primero, luego este dispositivo)
      </p>
    );
  if (!html)
    return (
      <p className="flex items-center gap-1.5">
        <Icon name="xCircle" size={16} className="text-red-600" />
        Proyecto no encontrado ni en la nube ni en este navegador.
      </p>
    );
  return (
    <div className="flex flex-col gap-2">
      {shared && (
        <p className="flex items-center gap-1.5 text-xs font-bold text-green-700">
          <Icon name="cloud" size={14} />
          Proyecto compartido desde la nube
        </p>
      )}
      <div className="rounded-3xl overflow-hidden border-4 border-[#1a1523] bg-white">
        <iframe
          title={slug}
          sandbox="allow-scripts"
          srcDoc={html}
          className="w-full h-[70vh] bg-white"
        />
      </div>
    </div>
  );
}

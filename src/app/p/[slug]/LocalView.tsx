"use client";

import { useEffect, useState } from "react";
import { getProjects } from "@/lib/store";
import { fetchSharedProject } from "@/lib/projects";

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
    return <p>❌ Proyecto no encontrado ni en la nube ni en este navegador.</p>;
  return (
    <div className="flex flex-col gap-2">
      {shared && (
        <p className="text-xs font-bold text-green-700">
          🌐 Proyecto compartido desde la nube
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

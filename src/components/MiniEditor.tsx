"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FilesModal, useAssetCount } from "./FilesModal";
import { PreviewModal } from "./PreviewModal";
import type { Generated } from "./BlocklyReal";
import type { Leccion } from "@/data/cursos";

const BlocklyReal = dynamic(() => import("./BlocklyReal").then((m) => m.BlocklyReal), {
  ssr: false,
  loading: () => <div className="p-6 rounded-xl border-4 font-bold">⏳ Cargando bloques...</div>,
});

export function MiniEditor({
  lessonId,
  curso,
  gen,
  onChange,
  instruccion,
  estado,
  showFiles,
  previewTitle,
  onPublish,
  publishLabel,
}: {
  lessonId: string;
  curso: Leccion["curso"];
  gen: Generated;
  onChange: (g: Generated) => void;
  instruccion: string;
  estado: string;
  showFiles: boolean;
  previewTitle: string;
  onPublish?: () => void;
  publishLabel?: string;
}) {
  const [preview, setPreview] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [tab, setTab] = useState("index");
  const fileCount = useAssetCount(lessonId);

  const tabs = [
    { id: "index", label: "📄 index", desc: "bloques 🧱", family: "html" as const },
    ...(curso !== "html" ? [{ id: "estilos", label: "🎨 estilos", desc: "CSS", family: "css" as const }] : []),
    ...(curso === "js" ? [{ id: "logica", label: "⚡ lógica", desc: "JS", family: "js" as const }] : []),
  ];
  const activeFamily = tabs.find((t) => t.id === tab)?.family ?? null;

  return (
    <div className="rounded-3xl overflow-hidden border-4 border-[#1a1523] dark:border-white/20 bg-[#1e1e2e] text-white block-shadow">
      {/* Tira horizontal corta con indicaciones */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#FFF8EC] dark:bg-black text-[#1a1523] dark:text-white border-b-4 border-[#1a1523] dark:border-white/20">
        <span className="text-sm">📝</span>
        <p className="text-xs md:text-sm font-bold truncate flex-1">{instruccion}</p>
        <span className="hidden md:inline text-xs font-bold rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5">{estado}</span>
      </div>

      {/* Barra tabs estilo VS Code + botón de archivos */}
      <div className="flex items-center gap-1 px-2 py-1 bg-[#2d2d3f] text-xs overflow-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-3 py-1.5 font-bold whitespace-nowrap ${tab === t.id ? "bg-[#1e1e2e] text-[#FFC700]" : "text-white/60 hover:bg-white/10"}`}
          >
            {t.label}
          </button>
        ))}
        {showFiles ? (
          <button
            onClick={() => setFilesOpen(true)}
            className="rounded-lg px-2 py-1.5 font-bold whitespace-nowrap text-white/80 hover:bg-white/10"
            title="Abrir mis archivos"
          >
            📁 ({fileCount})
          </button>
        ) : (
          <span className="rounded-lg px-2 py-1.5 font-bold whitespace-nowrap text-white/40" title="Los archivos se desbloquean en el Lab">
            🔒 📁
          </span>
        )}
        <span className="ml-auto text-[11px] text-white/50 hidden sm:inline">{gen.count} bloques</span>
      </div>

      {/* Editor a todo el ancho */}
      <div className="p-2 bg-white dark:bg-black min-h-[420px] md:min-h-[520px]">
        <p className="text-[11px] font-bold text-black/60 dark:text-white/60 mb-1">
          {tab === "index" ? "📄 Editando estructura 🧱 (HTML + 📁)" : tab === "estilos" ? "🎨 Editando estilos (solo bloques 🎨)" : "⚡ Editando lógica (solo bloques ⚡)"}
        </p>
        <BlocklyReal curso={curso} lessonId={lessonId} displayFamily={activeFamily} onChange={onChange} />
      </div>

      <FilesModal open={filesOpen} onClose={() => setFilesOpen(false)} lessonId={lessonId} />

      {/* FAB Probar siempre visible */}
      <button
        onClick={() => setPreview(true)}
        className="fixed bottom-20 lg:bottom-8 right-4 z-40 rounded-full bg-[#FF6B35] text-white font-extrabold px-5 py-3 block-shadow-sm text-sm"
        aria-label="Probar vista previa"
      >
        ▶ Probar
      </button>

      <PreviewModal open={preview} onClose={() => setPreview(false)} srcDoc={gen.srcDoc} title={previewTitle} count={gen.count} onPublish={onPublish} publishLabel={publishLabel} />
    </div>
  );
}

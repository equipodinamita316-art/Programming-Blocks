"use client";

import { useEffect, useState } from "react";

export function PreviewModal({
  open,
  onClose,
  srcDoc,
  title,
  count,
  onPublish,
  publishLabel,
}: {
  open: boolean;
  onClose: () => void;
  srcDoc: string;
  title: string;
  count: number;
  onPublish?: () => void;
  publishLabel?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      // z por encima de todas las capas de Blockly (.blocklyToolbox z-70,
      // dropdowns z-1000, editores z-99999, tooltips z-100000)
      className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/60 p-2 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista previa ${title}`}
    >
      <div
        className="w-full max-w-[1000px] h-[88vh] md:h-[85vh] flex flex-col rounded-2xl overflow-hidden border-4 border-[#1a1523] dark:border-white bg-white dark:bg-[#12101a]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-[#1a1523]/20">
          <span>🔴</span><span>🟡</span><span>🟢</span>
          <div className="flex-1 text-center text-xs md:text-sm font-mono font-bold truncate rounded-full bg-black/5 dark:bg-white/10 px-3 py-1">
            blockweb.page/{title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}
          </div>
          <span className="text-xs font-bold hidden sm:inline">{count} bloques</span>
          {onPublish && (
            <button onClick={onPublish} className="rounded-xl bg-[#a855f7] text-white text-xs md:text-sm font-bold px-3 py-1">
              {publishLabel || "🌐 Publicar"}
            </button>
          )}
          <button onClick={onClose} className="rounded-xl border-2 px-2 py-1 text-sm font-bold" aria-label="Cerrar vista previa">✕</button>
        </div>
        <ViewBody srcDoc={srcDoc} />
      </div>
    </div>
  );
}

function ViewBody({ srcDoc }: { srcDoc: string }) {
  const [view, setView] = useState<"mobile" | "desktop">("desktop");
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex gap-2 p-2 text-xs font-bold">
        <button onClick={() => setView("mobile")} className={`rounded-lg border px-2 py-1 ${view === "mobile" ? "bg-[#1a1523] text-white dark:bg-white dark:text-black" : ""}`}>📱 Móvil</button>
        <button onClick={() => setView("desktop")} className={`rounded-lg border px-2 py-1 ${view === "desktop" ? "bg-[#1a1523] text-white dark:bg-white dark:text-black" : ""}`}>🖥️ Desktop</button>
      </div>
      <div className="flex-1 min-h-0 bg-white flex justify-center overflow-auto">
        <div className={view === "mobile" ? "w-full max-w-[390px] border-x-4 border-dashed h-full" : "w-full h-full"}>
          <iframe title="preview-grande" sandbox="allow-scripts" srcDoc={srcDoc} className="w-full h-full min-h-[50vh] bg-white" />
        </div>
      </div>
    </div>
  );
}

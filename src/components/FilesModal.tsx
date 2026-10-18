"use client";

import { useEffect, useState } from "react";
import { AssetPanel } from "./AssetPanel";
import { Icon } from "./Icon";

function countAssets(lessonId: string): number {
  try {
    const metas = JSON.parse(
      localStorage.getItem("bw-assets-meta") || "[]",
    ) as { lessonId: string }[];
    return metas.filter(
      (m) => m.lessonId === lessonId || m.lessonId === "global",
    ).length;
  } catch {
    return 0;
  }
}

// Contador vivo de archivos (se actualiza con el evento bw-assets).
export function useAssetCount(lessonId: string): number {
  const [count, setCount] = useState(() => countAssets(lessonId));
  useEffect(() => {
    const h = () => setCount(countAssets(lessonId));
    window.addEventListener("bw-assets", h);
    return () => window.removeEventListener("bw-assets", h);
  }, [lessonId]);
  return count;
}

export function FilesModal({
  open,
  onClose,
  lessonId,
  copyMode,
}: {
  open: boolean;
  onClose: () => void;
  lessonId: string;
  copyMode?: "id" | "url";
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
      // mismo z que PreviewModal: por encima de todas las capas de Blockly
      className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Mis archivos"
    >
      <div
        className="w-full max-w-[560px] max-h-[85vh] overflow-auto rounded-2xl border-4 border-[#1a1523] bg-white p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-2">
          <h3 className="flex items-center gap-2 font-display font-extrabold text-lg">
            <Icon name="folder" size={18} />
            Mis archivos
          </h3>
          <button
            onClick={onClose}
            className="ml-auto flex items-center rounded-xl border-2 px-2 py-1 font-bold"
            aria-label="Cerrar archivos"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <AssetPanel lessonId={lessonId} copyMode={copyMode} />
      </div>
    </div>
  );
}

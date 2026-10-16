"use client";

import { useEffect, useRef, useState } from "react";
import { listAssets, saveAssetFile, deleteAsset, primeDataUrls, getAssetDataUrl, type Asset } from "@/lib/assets";

type BwUrls = { __bw_urls?: Record<string, string> };

export function AssetPanel({ lessonId, compact, copyMode }: { lessonId: string; compact?: boolean; copyMode?: "id" | "url" }) {
  const [items, setItems] = useState<{ asset: Asset; url: string }[]>([]);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let live = true;
    const apply = (all: { asset: Asset; url: string }[]) => {
      if (!live) return;
      // muestra los de esta lección + globales (miniaturas con blob:, válido aquí)
      setItems(all.filter((x) => x.asset.lessonId === lessonId || x.asset.lessonId === "global"));
      const urls: Record<string, string> = {};
      all.forEach((x) => { urls[x.asset.id] = x.url; });
      (globalThis as unknown as BwUrls).__bw_urls = urls;
      // en background: convierte a data: (válidos en iframes sandbox) y re-emite previews
      void primeDataUrls();
    };
    listAssets().then(apply).catch(() => {});
    const h = () => { listAssets().then(apply).catch(() => {}); };
    window.addEventListener("bw-assets", h);
    return () => {
      live = false;
      window.removeEventListener("bw-assets", h);
    };
  }, [lessonId]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setErr("");
    try {
      await saveAssetFile(lessonId, f);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "No se pudo subir");
    }
  };

  const copyAsset = async (id: string, url: string) => {
    if (copyMode === "url") {
      // En modo código se pega data: (los blob: no cargan en el preview sandbox)
      const data = await getAssetDataUrl(id).catch(() => "");
      navigator.clipboard?.writeText(data || url);
      alert("URL copiada: pégala en tu src. Si es muy larga, es normal (base64).");
      return;
    }
    navigator.clipboard?.writeText(id);
    alert(`ID copiado: ${id}\nPégalo en el bloque 📁 imagen/video mía`);
  };

  return (
    <div className={`${compact ? "rounded-xl border-2 p-2" : "rounded-2xl border-4 p-3"} border-[#1a1523] dark:border-white/20 bg-white dark:bg-white/5`}>
      <div className="flex items-center gap-2">
        <h3 className={`font-display font-extrabold ${compact ? "text-sm" : ""}`}>📂 Mis archivos ({items.length})</h3>
        <button onClick={() => fileRef.current?.click()} className="ml-auto rounded-lg bg-[#2563EB] text-white text-xs font-bold px-2 py-1">+ Subir 🖼️</button>
      </div>
      {!compact && <span className="text-xs opacity-60">imágenes y videos para tus bloques</span>}
      <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      {err && <p className="text-red-600 text-xs font-bold mt-1">{err}</p>}
      {items.length === 0 ? (
        <p className="text-xs opacity-60 mt-2">Vacío. Sube tu primera imagen o video y úsalo con el bloque 📁.</p>
      ) : (
        <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"} gap-2 mt-2`}>
          {items.map(({ asset, url }) => (
            <div key={asset.id} className="rounded-xl border-2 overflow-hidden">
              {asset.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={asset.name} className={`w-full ${compact ? "h-14" : "h-20"} object-cover`} />
              ) : (
                <video src={url} className={`w-full ${compact ? "h-14" : "h-20"} object-cover`} muted />
              )}
              <div className="p-1 text-[11px] font-bold truncate">{asset.name}</div>
              <div className="flex gap-1 p-1">
                <button onClick={() => copyAsset(asset.id, url)} className="flex-1 text-[11px] rounded-lg bg-black/5 dark:bg-white/10 py-1 font-bold">Usar</button>
                <button onClick={() => deleteAsset(asset.id)} className="text-[11px] rounded-lg px-2 py-1 border">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!compact && <p className="text-[11px] opacity-50 mt-2">Local ahora (IndexedDB) · nube después. Máx 5MB, solo imagen/video.</p>}
    </div>
  );
}

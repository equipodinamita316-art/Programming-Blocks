"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BLOCK_COUNT } from "@/lib/blockly/blocks";
import { AssetPanel } from "@/components/AssetPanel";
import { PreviewModal } from "@/components/PreviewModal";
import type { Generated } from "@/components/BlocklyReal";

const BlocklyReal = dynamic(() => import("@/components/BlocklyReal").then((m) => m.BlocklyReal), {
  ssr: false,
  loading: () => <div className="p-6 rounded-2xl border-4 font-bold">⏳ Cargando editor de bloques...</div>,
});

const EMPTY_GEN: Generated = { html: "", css: "", js: "", srcDoc: "", count: 0, types: [], purged: [] };

// Envuelve código escrito a mano en un documento válido (si no lo es ya).
function wrapCode(code: string): string {
  if (/<html[\s>]/i.test(code)) return code;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;padding:16px;}</style></head><body>${code || "<p style='opacity:.6'>Escribe tu código ⌨️</p>"}</body></html>`;
}

export default function Playground() {
  const [modo, setModo] = useState<"bloques" | "codigo">("bloques");
  const [gen, setGen] = useState<Generated>(EMPTY_GEN);
  const [code, setCode] = useState("");
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false);
  const [nombre, setNombre] = useState("Mi primera página");

  const fullCode = `<!-- 🧱 HTML -->\n${gen.html}\n<!-- 🎨 CSS -->\n<style>\n${gen.css}</style>\n<!-- ⚡ JS -->\n<script>\n${gen.js}</script>`;

  const goBloques = () => {
    if (modo === "bloques") return;
    if (dirty && !window.confirm("Volver a bloques descartará lo que escribiste a mano. ¿Seguir?")) return;
    setDirty(false);
    setModo("bloques");
  };

  const goCodigo = () => {
    if (modo === "codigo") return;
    setCode(fullCode);
    setDirty(false);
    setModo("codigo");
  };

  // El preview y publicar usan el modo activo. Bloques mandan al volver.
  const activeSrcDoc = modo === "bloques" ? gen.srcDoc : wrapCode(code);

  const publish = async () => {
    const slug = `${nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}-${Math.random().toString(36).slice(2, 6)}`;
    const { publishProject } = await import("@/lib/projects");
    const r = await publishProject({
      slug,
      nombre,
      html: activeSrcDoc,
      bloques: modo === "bloques" ? gen.types : [],
    });
    alert(`🚀 ${r.message} → /p/${slug}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold">🧱 Playground</h1>
        <span className="text-xs font-bold rounded-full bg-green-500 text-white px-2 py-1">{BLOCK_COUNT} bloques</span>
        {modo === "codigo" && dirty && (
          <span className="text-xs font-bold rounded-full bg-[#FFC700] px-2 py-1 border">✏️ Código manual — los bloques ya no coinciden</span>
        )}
      </div>

      {/* Barra única: proyecto + toggle + acciones */}
      <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="rounded-xl border-2 border-[#1a1523] dark:border-white/30 px-3 py-2 font-bold bg-white dark:bg-white/5 min-w-[180px] flex-1 sm:flex-none" placeholder="Nombre proyecto" />
        <div className="flex rounded-xl overflow-hidden border-2 border-[#1a1523] dark:border-white/30">
          <button onClick={goBloques} className={`px-4 py-2 ${modo === "bloques" ? "bg-[#1a1523] text-white dark:bg-white dark:text-black" : ""}`}>🧱 Bloques</button>
          <button onClick={goCodigo} className={`px-4 py-2 ${modo === "codigo" ? "bg-[#1a1523] text-white dark:bg-white dark:text-black" : ""}`}>⌨️ Código</button>
        </div>
        <button
          onClick={() => { navigator.clipboard?.writeText(modo === "bloques" ? fullCode : code); alert("Código copiado ✅"); }}
          className="rounded-xl border-2 px-3 py-2"
        >
          📋 Copiar
        </button>
        <button onClick={() => setPreview(true)} className="rounded-xl bg-[#FF6B35] text-white px-4 py-2">▶️ Probar</button>
        <button onClick={publish} className="rounded-xl bg-[#1a1523] text-white dark:bg-white dark:text-black px-4 py-2">🚀 Publicar</button>
      </div>

      {/* Editor único a máximo espacio */}
      {modo === "bloques" ? (
        <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="order-2 lg:order-1">
            <AssetPanel lessonId="playground" compact />
            <p className="text-xs opacity-60 mt-2">Sube imágenes/videos y úsalos con el bloque 📁. El workspace se guarda solo.</p>
          </div>
          <div className="order-1 lg:order-2 min-w-0">
            <BlocklyReal lessonId="playground" onChange={setGen} />
          </div>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="order-2 lg:order-1">
            <AssetPanel lessonId="playground" compact copyMode="url" />
            <p className="text-xs opacity-60 mt-2">Con “Usar” copias la URL lista para tu <code>src</code>.</p>
          </div>
          <div className="order-1 lg:order-2 min-w-0 rounded-2xl overflow-hidden border-4 border-[#1a1523] dark:border-white/20">
            <div className="px-3 py-1.5 bg-black text-green-300 text-xs font-bold font-mono">⌨️ index.html — editable (al volver a bloques se descarta)</div>
            <textarea
              value={code}
              onChange={(e) => { setCode(e.target.value); setDirty(true); }}
              spellCheck={false}
              className="w-full h-[62vh] min-h-[380px] bg-black text-green-200 font-mono text-sm p-4 outline-none resize-y"
              placeholder="Escribe tu HTML + <style> + <script>..."
            />
          </div>
        </div>
      )}

      <p className="text-xs opacity-60">
        Un solo editor: bloques con drag & drop o código a mano. Lo que ves en Probar es lo que se publica. <Link href="/proyectos" className="underline">Ver plantillas →</Link>
      </p>

      <PreviewModal
        open={preview}
        onClose={() => setPreview(false)}
        srcDoc={activeSrcDoc}
        title={nombre}
        count={modo === "bloques" ? gen.count : code.length}
        onPublish={publish}
        publishLabel="🚀 Publicar"
      />
    </div>
  );
}

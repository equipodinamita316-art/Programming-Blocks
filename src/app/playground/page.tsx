"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BLOCK_COUNT } from "@/lib/blockly/blocks";
import type { Generated } from "@/components/BlocklyReal";

const BlocklyReal = dynamic(() => import("@/components/BlocklyReal").then((m) => m.BlocklyReal), {
  ssr: false,
  loading: () => <div className="p-6 rounded-2xl border-4 font-bold">⏳ Cargando Blockly real...</div>,
});

export default function Playground() {
  const [gen, setGen] = useState<Generated>({ html: "", css: "", js: "", srcDoc: "", count: 0, types: [], purged: [] });
  const [tab, setTab] = useState<"bloques" | "codigo" | "vista">("bloques");
  const [nombre, setNombre] = useState("Mi primera página");
  const [view, setView] = useState<"mobile" | "desktop">("mobile");

  const fullCode = `<!-- 🧱 HTML -->\n${gen.html}\n<!-- 🎨 CSS -->\n<style>\n${gen.css}</style>\n<!-- ⚡ JS -->\n<script>\n${gen.js}</script>`;

  const publish = async () => {
    const slug = `${nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}-${Math.random().toString(36).slice(2, 6)}`;
    const { publishProject } = await import("@/lib/projects");
    const r = await publishProject({ slug, nombre, html: gen.srcDoc, bloques: gen.types });
    alert(`🚀 ${r.message} ${gen.count} bloques → /p/${slug}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold">🧱 Playground Blockly Real</h1>
        <span className="text-xs font-bold rounded-full bg-green-500 text-white px-2 py-1">{BLOCK_COUNT} bloques · drag & drop</span>
        <span className="text-xs font-bold rounded-full bg-[#FFC700] px-2 py-1 border">Híbrido: ver + copiar + editar en lección</span>
      </div>

      <div className="flex flex-wrap gap-2 text-sm font-bold">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="rounded-xl border-2 border-[#1a1523] dark:border-white/30 px-3 py-2 font-bold bg-white dark:bg-white/5" placeholder="Nombre proyecto" />
        <div className="flex rounded-xl overflow-hidden border-2 border-[#1a1523] dark:border-white/30">
          <button onClick={() => setView("mobile")} className={`px-3 py-2 ${view === "mobile" ? "bg-[#1a1523] text-white dark:bg-white dark:text-black" : ""}`}>📱 Móvil</button>
          <button onClick={() => setView("desktop")} className={`px-3 py-2 ${view === "desktop" ? "bg-[#1a1523] text-white dark:bg-white dark:text-black" : ""}`}>🖥️ Desktop</button>
        </div>
        <button onClick={() => { navigator.clipboard?.writeText(fullCode); alert("Código copiado ✅"); }} className="rounded-xl border-2 px-3 py-2">📋 Copiar código</button>
        <Link href="/aprender/html/html-1" className="rounded-xl border-2 px-3 py-2 underline">✏️ Editar en lección</Link>
        <button onClick={publish} className="rounded-xl bg-[#1a1523] text-white dark:bg-white dark:text-black px-4 py-2">🚀 Publicar ({gen.count})</button>
      </div>

      <div className="lg:hidden grid grid-cols-3 gap-2">
        {(["bloques", "codigo", "vista"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl border-2 border-[#1a1523] dark:border-white/30 py-2 font-bold capitalize ${tab === t ? "bg-[#1a1523] text-white dark:bg-white dark:text-black" : ""}`}>{t}</button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className={`${tab !== "bloques" ? "hidden lg:block" : ""}`}>
          <BlocklyReal onChange={setGen} />
          <p className="text-xs opacity-60 mt-1">Toolbox: 🧱 HTML 12 · 🎨 CSS 14 · ⚡ JS 14 = {BLOCK_COUNT} bloques. Arrastra al lienzo y encadena.</p>
        </div>
        <div className={`flex-col gap-3 ${tab === "bloques" ? "hidden lg:flex" : "flex"}`}>
          <div className={`${tab === "vista" ? "hidden" : ""} lg:block rounded-3xl border-4 border-[#1a1523] dark:border-white/20 bg-black text-green-200 p-3`}>
            <h2 className="font-extrabold text-sm text-white mb-2">{"</>"} Código generado (solo lectura híbrida) · {gen.count} bloques</h2>
            <pre className="text-xs font-mono whitespace-pre-wrap max-h-[260px] overflow-auto">{fullCode || "// arrastra bloques"}</pre>
          </div>
          <div className={`${tab !== "vista" && tab !== "bloques" ? "hidden" : ""} lg:block rounded-3xl overflow-hidden border-4 border-[#1a1523] dark:border-white/20 bg-white`}>
            <div className="text-xs font-bold px-2 py-1 bg-black/5 dark:bg-white/10">👁️ Vista previa viva · {view} · estilo WordPress</div>
            <div className={view === "mobile" ? "max-w-[390px] mx-auto border-x-4 border-dashed" : ""}>
              <iframe title="play-real" sandbox="allow-scripts" srcDoc={gen.srcDoc} className="w-full h-[420px] bg-white" />
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs opacity-60">Drag & drop total con Google Blockly. El código es resultado (híbrido): cópialo o edítalo en una lección. Se autoguardia en este navegador. <Link href="/proyectos" className="underline">Ver plantillas →</Link></p>
    </div>
  );
}

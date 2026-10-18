"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BLOCK_COUNT } from "@/lib/blockly/blocks";
import { FilesModal, useAssetCount } from "@/components/FilesModal";
import { PreviewModal } from "@/components/PreviewModal";
import { CodeView } from "@/components/CodeView";
import { EditorTabBar, type EditorTab } from "@/components/EditorTabBar";
import { useNotice } from "@/lib/notice";
import { Icon } from "@/components/Icon";
import type { Generated } from "@/components/BlocklyReal";

const BlocklyReal = dynamic(
  () => import("@/components/BlocklyReal").then((m) => m.BlocklyReal),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 p-6 rounded-2xl border-4 font-bold">
        <Icon name="hourglass" size={18} />
        Cargando editor de bloques...
      </div>
    ),
  },
);

const EMPTY_GEN: Generated = {
  html: "",
  css: "",
  js: "",
  srcDoc: "",
  count: 0,
  types: [],
  purged: [],
};

type TabId = "index" | "estilos" | "logica" | "codigo";

const TABS: EditorTab[] = [
  { id: "index", text: "index", icon: "file", family: "html" },
  { id: "estilos", text: "estilos", icon: "palette", family: "css" },
  { id: "logica", text: "lógica", icon: "bolt", family: "js" },
  { id: "codigo", text: "código", icon: "keyboard", family: "html" },
];

// Envuelve código escrito a mano en un documento válido (si no lo es ya).
function wrapCode(code: string): string {
  if (/<html[\s>]/i.test(code)) return code;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;padding:16px;}</style></head><body>${code || "<p style='opacity:.6'>Escribe tu código</p>"}</body></html>`;
}

export default function Playground() {
  const [tab, setTab] = useState<TabId>("index");
  const [gen, setGen] = useState<Generated>(EMPTY_GEN);
  const [codigo, setCodigo] = useState({ html: "", css: "", js: "" });
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [nombre, setNombre] = useState("Mi primera página");
  const fileCount = useAssetCount("playground");

  const activeFamily = TABS.find((t) => t.id === tab)?.family ?? "html";
  const enCodigo = tab === "codigo";

  const fullCode = `<!-- HTML -->\n${gen.html}\n<!-- CSS -->\n<style>\n${gen.css}</style>\n<!-- JS -->\n<script>\n${gen.js}</script>`;
  const manualCode = `<!-- HTML -->\n${codigo.html}\n<!-- CSS -->\n<style>\n${codigo.css}</style>\n<!-- JS -->\n<script>\n${codigo.js}</script>`;

  const { notify, celebrate, askDanger } = useNotice();

  const selectTab = async (next: string) => {
    if (next === tab) return;
    if (enCodigo && dirty) {
      const ok = await askDanger({
        title: "¿Descartar tu código?",
        body: "Volver a los bloques borrará lo que escribiste a mano.",
        confirmLabel: "Sí, descartar",
      });
      if (!ok) return;
      setDirty(false);
    }
    if (next === "codigo") {
      setCodigo({ html: gen.html, css: gen.css, js: gen.js });
      setDirty(false);
    }
    setTab(next as TabId);
  };

  // El preview y publicar usan la pestaña activa.
  const activeSrcDoc = enCodigo ? wrapCode(manualCode) : gen.srcDoc;

  const publish = async () => {
    const slug = `${nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40)}-${Math.random().toString(36).slice(2, 6)}`;
    const { publishProject } = await import("@/lib/projects");
    const r = await publishProject({
      slug,
      nombre,
      html: activeSrcDoc,
      bloques: enCodigo ? [] : gen.types,
    });
    celebrate({
      title: "¡Publicado!",
      sub: r.message,
      actions: [{ label: "Ver mi página", href: `/p/${slug}`, primary: true }],
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="flex items-center gap-2 font-display text-2xl md:text-3xl font-extrabold">
          <Icon name="blocks" size={26} />
          Playground
        </h1>
        <span className="text-xs font-bold rounded-full bg-green-500 text-white px-2 py-1">
          {BLOCK_COUNT} bloques
        </span>
        {enCodigo && dirty && (
          <span className="flex items-center gap-1.5 text-xs font-bold rounded-full bg-[#FFC700] px-2 py-1 border">
            <Icon name="pencil" size={13} />
            Código manual — los bloques ya no coinciden
          </span>
        )}
      </div>

      {/* Barra única: proyecto + acciones */}
      <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="rounded-xl border-2 border-[#1a1523] px-3 py-2 font-bold bg-white min-w-[180px] flex-1 sm:flex-none"
          placeholder="Nombre proyecto"
        />
        <button
          onClick={() => {
            navigator.clipboard?.writeText(enCodigo ? manualCode : fullCode);
            notify("Código copiado", "exito");
          }}
          className="flex items-center gap-1.5 rounded-xl border-2 px-3 py-2"
        >
          <Icon name="clipboard" size={15} />
          Copiar
        </button>
        <button
          onClick={() => setPreview(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#FF6B35] text-white px-4 py-2"
        >
          <Icon name="play" size={15} />
          Probar
        </button>
        <button
          onClick={publish}
          className="flex items-center gap-1.5 rounded-xl bg-[#1a1523] text-white px-4 py-2"
        >
          <Icon name="rocket" size={15} />
          Publicar
        </button>
      </div>

      {/* Editor con la misma barra de pestañas que las lecciones */}
      <div className="rounded-3xl overflow-hidden border-4 border-[#1a1523] bg-[#1e1e2e] text-white block-shadow">
        <EditorTabBar
          tabs={TABS}
          active={tab}
          onSelect={selectTab}
          fileCount={fileCount}
          showFiles
          onOpenFiles={() => setFilesOpen(true)}
          blockCount={gen.count}
        />
        <div className="p-2 bg-white min-h-[420px] md:min-h-[520px]">
          <div className={enCodigo ? "hidden" : ""}>
            <BlocklyReal
              lessonId="playground"
              displayFamily={activeFamily}
              onChange={setGen}
            />
            <p className="mt-1 flex items-center gap-1.5 text-xs opacity-60">
              <Icon name="folder" size={13} />
              Abre Archivos para subir imágenes/videos y úsalos con el bloque de
              archivos. El workspace se guarda solo.
            </p>
          </div>
          {enCodigo && (
            <CodeView
              editable
              html={codigo.html}
              css={codigo.css}
              js={codigo.js}
              onChange={(lang, text) => {
                setCodigo((c) => ({ ...c, [lang]: text }));
                setDirty(true);
              }}
            />
          )}
        </div>
      </div>

      <p className="text-xs opacity-60">
        Un solo editor: bloques con drag &amp; drop o código a mano. Lo que ves en
        Probar es lo que se publica.{" "}
        <Link href="/proyectos" className="inline-flex items-center gap-1 underline">
          Ver plantillas
          <Icon name="arrowRight" size={13} />
        </Link>
      </p>

      <FilesModal
        open={filesOpen}
        onClose={() => setFilesOpen(false)}
        lessonId="playground"
        copyMode={enCodigo ? "url" : "id"}
      />

      <PreviewModal
        open={preview}
        onClose={() => setPreview(false)}
        srcDoc={activeSrcDoc}
        title={nombre}
        count={enCodigo ? manualCode.length : gen.count}
        onPublish={publish}
        publishLabel="Publicar"
      />
    </div>
  );
}

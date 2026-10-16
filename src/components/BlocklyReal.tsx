"use client";

import { useEffect, useRef, useState } from "react";
import type { Block, WorkspaceSvg } from "blockly";
import { BLOCK_DEFS } from "@/lib/blockly/blocks";
import { generateFromBlocks, combineSrcDoc } from "@/lib/blockly/generators";
import {
  ALLOW,
  getToolboxForCurso,
  getDisplayToolbox,
  type Family,
} from "@/lib/blockly/scope";
import type { CursoSlug } from "@/lib/store";

export type Generated = {
  html: string;
  css: string;
  js: string;
  srcDoc: string;
  count: number;
  types: string[];
  purged: string[];
};

export function BlocklyReal({
  curso,
  lessonId,
  starterXml,
  displayFamily,
  onChange,
}: {
  curso?: CursoSlug;
  lessonId?: string;
  starterXml?: string;
  displayFamily?: Family | null;
  onChange: (g: Generated) => void;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WorkspaceSvg | null>(null);
  const emitRef = useRef<(() => void) | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");
  const [purged, setPurged] = useState<string[]>([]);

  const storageKey = lessonId ? `bw-blockly-${lessonId}` : "bw-blockly";

  useEffect(() => {
    let disposed = false;
    let workspace: WorkspaceSvg | null = null;
    const container = divRef.current;

    (async () => {
      try {
        const Blockly = await import("blockly");
        if (disposed || !container) return;

        if (!Blockly.Blocks["bw_h"]) {
          Blockly.defineBlocksWithJsonArray(
            BLOCK_DEFS as Parameters<
              typeof Blockly.defineBlocksWithJsonArray
            >[0],
          );
        }

        const toolbox = curso
          ? getToolboxForCurso(curso)
          : (await import("@/lib/blockly/toolbox")).TOOLBOX;
        const allow = curso ? ALLOW[curso] : null;

        // Anti-zombie: si quedó una inyección previa en el contenedor, eliminarla
        // antes de inyectar (evita toolboxes duplicadas fuera de su recuadro).
        try {
          wsRef.current?.dispose();
        } catch {}
        wsRef.current = null;
        try {
          container
            ?.querySelectorAll(":scope > .injectionDiv")
            .forEach((n) => n.remove());
        } catch {}

        workspace = Blockly.inject(container, {
          toolbox: toolbox as unknown as Element,
          trashcan: true,
          zoom: { controls: true, wheel: true, startScale: 0.9 },
          scrollbars: true,
          renderer: "zelos",
        } as unknown as Parameters<typeof Blockly.inject>[1]);
        wsRef.current = workspace;

        const purge = (): string[] => {
          if (!allow || !workspace) return [];
          const bad: Block[] = workspace
            .getAllBlocks(false)
            .filter((b) => !allow.has(b.type));
          const types = [...new Set(bad.map((b) => b.type))];
          bad.forEach((b) => {
            try {
              b.dispose();
            } catch {}
          });
          setPurged(types);
          return types;
        };

        // Limpieza de scrollbars huérfanas del flyout: al cerrar el panel de
        // categorías a veces queda pintado el handle (.blocklyFlyoutScrollbar).
        // Solo se oculta si su flyout está cerrado (no rompe el scroll abierto).
        const sweepStaleScrollbars = () => {
          try {
            const root = container;
            const flyout = workspace?.getFlyout() as unknown as {
              isVisible?: () => boolean;
            } | null;
            if (!root || !flyout || flyout.isVisible?.() !== false) return;
            root.querySelectorAll(".blocklyFlyoutScrollbar").forEach((el) => {
              (el as HTMLElement).style.display = "none";
            });
          } catch {}
        };

        const unhideFlyoutScrollbars = () => {
          try {
            container
              ?.querySelectorAll(".blocklyFlyoutScrollbar")
              .forEach((el) => {
                (el as HTMLElement).style.display = "";
              });
          } catch {}
        };

        const emit = () => {
          if (!workspace) return;
          purge();
          sweepStaleScrollbars();
          const blocks = workspace.getAllBlocks(false);
          const types = blocks.map((b) => b.type);
          const { html, css, js } = generateFromBlocks(blocks);
          // hidrata assets: reemplaza CUALQUIER src del data-asset con la URL fresca
          // (data: tras primeDataUrls; blob: solo como fallback transitorio)
          let htmlH = html;
          try {
            const urls =
              (globalThis as unknown as { __bw_urls?: Record<string, string> })
                .__bw_urls || {};
            const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            for (const [id, url] of Object.entries(urls)) {
              htmlH = htmlH.replace(
                new RegExp(`data-asset="${esc(id)}" src="[^"]*"`, "g"),
                `data-asset="${id}" src="${url}"`,
              );
            }
          } catch {}
          onChange({
            html: htmlH,
            css,
            js,
            srcDoc: combineSrcDoc(htmlH, css, js),
            count: blocks.length,
            types,
            purged: [],
          });
          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify(Blockly.serialization.workspaces.save(workspace)),
            );
          } catch {}
        };

        // restaurar por lección (purga foráneos inyectados a mano)
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            Blockly.serialization.workspaces.load(JSON.parse(saved), workspace);
            purge();
          } else if (starterXml) {
            const dom = Blockly.utils.xml.textToDom(starterXml);
            Blockly.Xml.domToWorkspace(dom, workspace);
          } else if (!curso) {
            const xmlText = `<xml><block type="bw_h" x="20" y="20"><field name="LEVEL">h1</field><field name="TEXT">Mi página gamer</field></block></xml>`;
            const dom = Blockly.utils.xml.textToDom(xmlText);
            Blockly.Xml.domToWorkspace(dom, workspace);
          }
        } catch {}

        workspace.addChangeListener((e) => {
          // Al cerrar el panel de categorías (deselección), barrer la scrollbar
          // huérfana; al abrirlo, restaurar su display por si se había ocultado.
          if (e.type === Blockly.Events.TOOLBOX_ITEM_SELECT) {
            const item = (e as unknown as { newItem?: string | null }).newItem;
            if (item) unhideFlyoutScrollbars();
            else sweepStaleScrollbars();
          }
          emit();
        });
        emitRef.current = emit;

        // Re-medir a Blockly cuando el contenedor cambie de tamaño (resize,
        // tabs, drawer): recoloca toolbox, flyout y scrollbars dentro del recuadro.
        try {
          roRef.current?.disconnect();
          const ro = new ResizeObserver(() => {
            try {
              if (!disposed && workspace) Blockly.svgResize(workspace);
            } catch {}
          });
          if (container) ro.observe(container);
          roRef.current = ro;
        } catch {}
        emit();
        setReady(true);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "No se pudo cargar Blockly");
      }
    })();

    return () => {
      disposed = true;
      try {
        roRef.current?.disconnect();
      } catch {}
      roRef.current = null;
      try {
        wsRef.current?.dispose();
      } catch {}
      wsRef.current = null;
      try {
        container
          ?.querySelectorAll(":scope > .injectionDiv")
          .forEach((n) => n.remove());
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curso, lessonId]);

  const clear = () => {
    try {
      wsRef.current?.clear();
      localStorage.removeItem(storageKey);
    } catch {}
  };

  // Las tabs del MiniEditor filtran lo visible (no borran nada ya construido)
  useEffect(() => {
    try {
      if (wsRef.current && curso) {
        wsRef.current.updateToolbox(
          getDisplayToolbox(curso, displayFamily ?? null) as unknown as Element,
        );
      }
    } catch {}
  }, [displayFamily, curso]);

  // Cuando llegan las data URLs de assets, re-emite para que previews y
  // publicados usen data: en vez de blob: (válidos en sandbox opaco)
  useEffect(() => {
    const h = () => {
      emitRef.current?.();
    };
    window.addEventListener("bw-assets-ready", h);
    return () => window.removeEventListener("bw-assets-ready", h);
  }, []);

  if (err)
    return (
      <div className="p-4 rounded-2xl border-2 border-red-500 text-sm">
        ❌ {err}
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-bold opacity-70">
        <span>
          {ready
            ? `🟢 Bloques ${curso ? curso.toUpperCase() + " " : ""}· drag & drop`
            : "⏳ Cargando Blockly..."}
        </span>
        <button onClick={clear} className="ml-auto underline">
          Limpiar
        </button>
      </div>
      {purged.length > 0 && (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 p-2 text-xs font-bold">
          🧹 Bloques no permitidos eliminados: {purged.join(", ")}
        </div>
      )}
      <div
        ref={divRef}
        className="relative w-full h-[420px] md:h-[520px] rounded-2xl border-4 border-[#1a1523] bg-white overflow-hidden"
      />
    </div>
  );
}

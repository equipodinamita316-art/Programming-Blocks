"use client";

import { useRef, useState } from "react";

type Lang = "html" | "css" | "js";

const LANGS: { id: Lang; label: string }[] = [
  { id: "html", label: "index.html" },
  { id: "css", label: "estilos.css" },
  { id: "js", label: "logica.js" },
];

export function CodeView({
  html,
  css,
  js,
  editable = false,
  onChange,
  hideEmpty = false,
}: {
  html: string;
  css: string;
  js: string;
  editable?: boolean;
  onChange?: (lang: Lang, text: string) => void;
  hideEmpty?: boolean;
}) {
  const contents: Record<Lang, string> = { html, css, js };
  const langs = hideEmpty
    ? LANGS.filter((l) => contents[l.id].trim())
    : LANGS;
  const visible = langs.length ? langs : LANGS;
  const [which, setWhich] = useState<Lang>(visible[0].id);
  const code = contents[which];
  const preRef = useRef<HTMLPreElement>(null);

  return (
    <div className="rounded-2xl overflow-hidden border-4 border-[#1a1523] bg-[#0d0b12]">
      <div className="flex gap-1 px-2 py-1 bg-[#1e1e2e] text-xs">
        {visible.map((l) => (
          <button
            key={l.id}
            onClick={() => setWhich(l.id)}
            className={`rounded-t-lg px-3 py-1.5 font-bold ${which === l.id ? "bg-[#0d0b12] text-[#FFC700]" : "text-white/60 hover:bg-white/10"}`}
          >
            {l.label}
          </button>
        ))}
        {editable && (
          <span className="ml-auto self-center pr-1 text-[11px] font-bold text-white/40">
            editable
          </span>
        )}
      </div>
      {editable ? (
        <div className="relative">
          <pre
            ref={preRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 m-0 p-3 text-xs md:text-sm overflow-auto text-[#e5e7eb] font-mono leading-relaxed whitespace-pre-wrap break-words"
          >
            <code dangerouslySetInnerHTML={{ __html: hl(code + "\n", which) }} />
          </pre>
          <textarea
            value={code}
            onChange={(e) => onChange?.(which, e.target.value)}
            onScroll={(e) => {
              const pre = preRef.current;
              if (pre) {
                pre.scrollTop = e.currentTarget.scrollTop;
                pre.scrollLeft = e.currentTarget.scrollLeft;
              }
            }}
            spellCheck={false}
            wrap="soft"
            style={{ caretColor: "#e5e7eb" }}
            className="relative w-full h-[52vh] min-h-[380px] p-3 text-xs md:text-sm bg-transparent text-transparent font-mono leading-relaxed whitespace-pre-wrap break-words outline-none resize-none border-0 overflow-auto"
            placeholder=""
          />
        </div>
      ) : (
        <pre className="p-3 text-xs md:text-sm overflow-auto max-h-[520px] text-[#e5e7eb] font-mono leading-relaxed">
          <code dangerouslySetInnerHTML={{ __html: hl(code || "/* vacío */", which) }} />
        </pre>
      )}
    </div>
  );
}

function hl(code: string, lang: Lang): string {
  let s = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const marks: string[] = [];
  const keep = (cls: string, text: string) => {
    marks.push(`<span class="${cls}">${text}</span>`);
    return `\u0000${marks.length - 1}\u0000`;
  };
  if (lang === "html") {
    s = s.replace(
      /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?)([a-zA-Z][\w-]*)|(&gt;)|("[^"]*")|('[^']*')/g,
      (m, cm: string, nm: string, tag: string, gt: string, dq: string, sq: string) => {
        if (cm) return keep("text-white/40", cm);
        if (tag) return nm + keep("text-[#FF6B35]", tag);
        if (gt) return keep("text-[#FF6B35]", gt);
        if (dq) return keep("text-[#FFC700]", dq);
        if (sq) return keep("text-[#FFC700]", sq);
        return m;
      },
    );
  } else if (lang === "css") {
    s = s.replace(
      /(\/\*[\s\S]*?\*\/)|([^{}\n;]+)(\{)|([\w-]+)(\s*:)|("[^"]*")|('[^']*')/g,
      (m, cm: string, sel: string, br: string, prop: string, col: string, dq: string, sq: string) => {
        if (cm) return keep("text-white/40", cm);
        if (sel) return keep("text-[#FF6B35]", sel) + br;
        if (prop) return keep("text-[#FFC700]", prop) + col;
        if (dq) return keep("text-[#4ade80]", dq);
        if (sq) return keep("text-[#4ade80]", sq);
        return m;
      },
    );
  } else {
    s = s.replace(
      /(\/\/[^\n]*)|('[^']*')|("[^"]*")|(`[^`]*`)|\b(let|const|var|function|if|else|for|return|try|catch|await|async|new|document|window|localStorage)\b|\b(\d+)\b/g,
      (m, cm: string, sq: string, dq: string, bt: string, kw: string, num: string) => {
        if (cm) return keep("text-white/40", cm);
        if (sq) return keep("text-[#4ade80]", sq);
        if (dq) return keep("text-[#4ade80]", dq);
        if (bt) return keep("text-[#4ade80]", bt);
        if (kw) return keep("text-[#a855f7]", kw);
        if (num) return keep("text-[#60a5fa]", num);
        return m;
      },
    );
  }
  return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => marks[Number(i)]);
}

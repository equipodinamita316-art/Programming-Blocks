// Starter: convierte código inicial/roto (HTML) a un workspace de bloques.
// Best-effort: mapea las etiquetas que nuestros bloques saben generar; ignora
// <style>/<script>/comentarios. Sirve para que el editor no arranque vacío.

export type BlockSpec = {
  type: string;
  fields?: Record<string, string>;
  inputs?: Record<string, BlockSpec[]>;
};

type Node = { tag: string; attrs: Record<string, string>; children: Node[]; text: string };

const VOID = new Set([
  "img", "br", "hr", "input", "meta", "link", "source", "col", "area", "base",
  "embed", "param", "track", "wbr",
]);
const SEM = new Set(["header", "nav", "main", "section", "article", "footer", "aside"]);
const PASS_THROUGH = new Set(["html", "head", "body"]);

function parseAttrs(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([\w-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) out[m[1].toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? "";
  return out;
}

function parseHtml(input: string): Node[] {
  const s = input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  const root: Node = { tag: "#root", attrs: {}, children: [], text: "" };
  const stack: Node[] = [root];
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:\s+[^>]*?)?)\/?>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    stack[stack.length - 1].text += s.slice(last, m.index);
    last = re.lastIndex;
    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    if (closing) {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tag) {
          stack.length = i;
          break;
        }
      }
    } else {
      const node: Node = { tag, attrs: parseAttrs(m[3] || ""), children: [], text: "" };
      stack[stack.length - 1].children.push(node);
      if (!VOID.has(tag) && !m[0].endsWith("/>")) stack.push(node);
    }
  }
  stack[stack.length - 1].text += s.slice(last);
  return root.children;
}

function descendants(n: Node, tag: string): Node[] {
  const out: Node[] = [];
  for (const c of n.children) {
    if (c.tag === tag) out.push(c);
    out.push(...descendants(c, tag));
  }
  return out;
}

function tableRows(n: Node): string {
  return descendants(n, "tr")
    .filter((tr) => tr.children.some((c) => c.tag === "td"))
    .map((tr) => {
      const tds = tr.children.filter((c) => c.tag === "td");
      return `${tds[0]?.text.trim() || "A"}:${tds[1]?.text.trim() || "1"}`;
    })
    .join(", ");
}

function nodeToSpec(n: Node): BlockSpec | null {
  const a = n.attrs;
  const text = n.text.trim();
  switch (n.tag) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6": {
      const lvl = ["h1", "h2", "h3"].includes(n.tag) ? n.tag : "h3";
      return { type: "bw_h", fields: { LEVEL: lvl, TEXT: text || "Título" } };
    }
    case "p":
      return { type: "bw_p", fields: { TEXT: text || "Texto" } };
    case "a":
      return { type: "bw_a", fields: { TEXT: text || "Link", URL: a.href || "https://example.com" } };
    case "img":
      return { type: "bw_img", fields: { URL: a.src || "https://placehold.co/300x150", ALT: a.alt || "mi obra" } };
    case "button":
      return { type: "bw_button", fields: { ID: a.id || "magia", TEXT: text || "Click" } };
    case "input":
      return {
        type: "bw_input",
        fields: {
          ID: a.id || "x",
          TYPE: ["text", "email", "password", "number"].includes(a.type) ? a.type : "text",
          PH: a.placeholder || "Escribe aquí",
        },
      };
    case "ul":
    case "ol": {
      const items = n.children
        .filter((c) => c.tag === "li")
        .map((c) => c.text.trim())
        .filter(Boolean)
        .join(", ");
      return { type: "bw_list", fields: { KIND: n.tag, ITEMS: items || "Espada, Escudo" } };
    }
    case "table":
      return { type: "bw_table", fields: { CAP: n.text.trim() || "Torneo", ROWS: tableRows(n) || "Alex:100, Bloqui:95" } };
    case "form":
      return { type: "bw_form", fields: { ID: a.id || "f", BTN: "Enviar" } };
    case "video":
      return { type: "bw_video", fields: { URL: a.src || "https://www.w3schools.com/html/mov_bbb.mp4" } };
    case "audio":
      return { type: "bw_audio", fields: { URL: a.src || "https://www.w3schools.com/html/horse.mp3" } };
    case "iframe":
      return {
        type: "bw_iframe",
        fields: {
          URL: a.src || "https://www.youtube.com/embed/dQw4w9WgXcQ",
          W: ["300", "480", "560"].includes(a.width) ? a.width : "300",
          H: ["170", "270", "315"].includes(a.height) ? a.height : "170",
        },
      };
    case "details": {
      const sum = descendants(n, "summary")[0]?.text.trim();
      const ps = descendants(n, "p")
        .map((p) => p.text.trim())
        .filter(Boolean)
        .join(" ");
      return { type: "bw_details", fields: { SUM: sum || "Ver más", TEXT: ps || "Mi secreto gamer" } };
    }
    case "progress":
      return {
        type: "bw_progress",
        fields: { VAL: a.value || "70", MAX: ["5", "10", "100"].includes(a.max) ? a.max : "100" },
      };
    case "title": {
      const desc = "";
      return { type: "bw_head", fields: { TITLE: text || "Mi página", DESC: desc } };
    }
    default:
      return null;
  }
}

function nodeToSpecs(nodes: Node[]): BlockSpec[] {
  const out: BlockSpec[] = [];
  for (const n of nodes) {
    if (PASS_THROUGH.has(n.tag)) {
      out.push(...nodeToSpecs(n.children));
      continue;
    }
    if (SEM.has(n.tag)) {
      out.push({ type: "bw_sem", fields: { TAG: n.tag }, inputs: { DO: nodeToSpecs(n.children) } });
      continue;
    }
    if (n.tag === "div") {
      out.push({ type: "bw_div", inputs: { DO: nodeToSpecs(n.children) } });
      continue;
    }
    const spec = nodeToSpec(n);
    if (spec) out.push(spec);
    // Etiquetas no soportadas pero con hijos: no perder la estructura interna.
    if (n.children.length && !spec) out.push(...nodeToSpecs(n.children));
  }
  return out;
}

export function codeToBlocks(code: string): BlockSpec[] {
  if (!code) return [];
  const specs = nodeToSpecs(parseHtml(code));
  // Descripción de la página: si hay <meta name="description">, adjúntala al bw_head.
  const desc = code.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1];
  if (desc) {
    const head = specs.find((s) => s.type === "bw_head");
    if (head) head.fields = { ...head.fields, DESC: desc };
  }
  return specs;
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blockXml(spec: BlockSpec, pos?: { x: number; y: number }): string {
  const at = pos ? ` x="${pos.x}" y="${pos.y}"` : "";
  const fields = Object.entries(spec.fields ?? {})
    .map(([k, v]) => `<field name="${k}">${esc(v)}</field>`)
    .join("");
  const inputs = Object.entries(spec.inputs ?? {})
    .map(([k, children]) => `<statement name="${k}">${chainXml(children)}</statement>`)
    .join("");
  return `<block type="${spec.type}"${at}>${fields}${inputs}</block>`;
}

function chainXml(specs: BlockSpec[]): string {
  if (!specs.length) return "";
  const [first, ...rest] = specs;
  if (!rest.length) return blockXml(first);
  const block = blockXml(first);
  const i = block.lastIndexOf("</block>");
  const next = `<next>${chainXml(rest)}</next>`;
  return block.slice(0, i) + next + block.slice(i);
}

// Cada bloque de primer nivel como torre independiente, en columna.
export function specsToXml(specs: BlockSpec[]): string {
  if (!specs.length) return "";
  const parts = specs.map((s, i) => blockXml(s, { x: 30, y: 30 + i * 150 }));
  return `<xml xmlns="https://developers.google.com/blockly/xml">${parts.join("")}</xml>`;
}

// Proyecto inicial de la lección. Si el Boss no trae HTML propio (solo
// style/script), se parte del código inicial para arreglarlo con bloques.
export function starterXmlFromCode(code: string): string {
  return specsToXml(codeToBlocks(code));
}

export function starterXmlForBoss(codigoInicial: string, bossCodigoRoto?: string): string {
  const boss = bossCodigoRoto ? starterXmlFromCode(bossCodigoRoto) : "";
  return boss || starterXmlFromCode(codigoInicial);
}

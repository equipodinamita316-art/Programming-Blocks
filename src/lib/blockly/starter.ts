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
  const re = /([\w:-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (!m[1]) continue;
    const key = m[1].toLowerCase();
    out[key] = m[2] === undefined ? "" : m[3] ?? m[4] ?? m[5] ?? "";
  }
  return out;
}

// Texto de los <label for="id"> para asociarlos a su control.
function gatherLabels(nodes: Node[]): Record<string, string> {
  const map: Record<string, string> = {};
  const walk = (n: Node) => {
    if (n.tag === "label" && n.attrs.for) map[n.attrs.for] = n.text.trim();
    n.children.forEach(walk);
  };
  nodes.forEach(walk);
  return map;
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

function nodeToSpec(n: Node, labels: Record<string, string>, wrapLabel?: string): BlockSpec | null {
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
      return { type: "bw_h", fields: { LEVEL: lvl, ID: a.id || "", TEXT: text || "Título" } };
    }
    case "p":
      return { type: "bw_p", fields: { TEXT: text || "Texto", ID: a.id || "" } };
    case "a":
      return { type: "bw_a", fields: { TEXT: text || "Link", URL: a.href || "https://example.com" } };
    case "img":
      return { type: "bw_img", fields: { URL: a.src || "https://placehold.co/300x150", ALT: a.alt || "mi obra" } };
    case "button":
      return { type: "bw_button", fields: { ID: a.id || "magia", TEXT: text || "Click" } };
    case "input": {
      const isCheckbox = a.type === "checkbox";
      const type = ["text", "email", "password", "number", "tel", "date", "color"].includes(a.type) ? a.type : "text";
      const label = wrapLabel || labels[a.id] || a["aria-label"] || "";
      const req = a.required !== undefined ? "TRUE" : "FALSE";
      if (isCheckbox) {
        return { type: "bw_checkbox", fields: { ID: a.id || "acepto", LABEL: label || "Acepto", REQUIRED: req } };
      }
      return {
        type: "bw_input",
        fields: { ID: a.id || "x", LABEL: label || "Campo", TYPE: type, REQUIRED: req, PH: a.placeholder || "Escribe aquí" },
      };
    }
    case "select": {
      const opts = n.children
        .filter((c) => c.tag === "option")
        .map((c) => c.text.trim())
        .filter(Boolean)
        .join(", ");
      return {
        type: "bw_select",
        fields: { ID: a.id || "lvl", LABEL: wrapLabel || labels[a.id] || "Elige", OPTS: opts || "Novato, Pro" },
      };
    }
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
      return { type: "bw_head", fields: { TITLE: text || "Mi página", DESC: desc, ICON: "" } };
    }
    default:
      return null;
  }
}

function nodeToSpecs(nodes: Node[], labels: Record<string, string>): BlockSpec[] {
  const out: BlockSpec[] = [];
  for (const n of nodes) {
    if (PASS_THROUGH.has(n.tag)) {
      out.push(...nodeToSpecs(n.children, labels));
      continue;
    }
    if (n.tag === "label") {
      if (n.attrs.for) continue;
      const ctrl = n.children.find((c) => c.tag === "input" || c.tag === "select");
      if (ctrl) {
        const spec = nodeToSpec(ctrl, labels, n.text.trim());
        if (spec) out.push(spec);
        out.push(...nodeToSpecs(n.children.filter((c) => c !== ctrl), labels));
      } else {
        out.push(...nodeToSpecs(n.children, labels));
      }
      continue;
    }
    if (n.tag === "form") {
      const btn = n.children.find((c) => c.tag === "button");
      const kids = n.children.filter((c) => c !== btn);
      out.push({
        type: "bw_form",
        fields: { ID: n.attrs.id || "f", BTN: btn?.text.trim() || "Enviar" },
        inputs: { DO: nodeToSpecs(kids, labels) },
      });
      continue;
    }
    if (SEM.has(n.tag)) {
      out.push({ type: "bw_sem", fields: { TAG: n.tag }, inputs: { DO: nodeToSpecs(n.children, labels) } });
      continue;
    }
    if (n.tag === "div") {
      out.push({ type: "bw_div", fields: { ID: n.attrs.id || "" }, inputs: { DO: nodeToSpecs(n.children, labels) } });
      continue;
    }
    const spec = nodeToSpec(n, labels);
    if (spec) out.push(spec);
    // Etiquetas no soportadas pero con hijos: no perder la estructura interna.
    if (n.children.length && !spec) out.push(...nodeToSpecs(n.children, labels));
  }
  return out;
}

// ===== JS: <script> → bloques de lógica =====
// Best-effort: declaraciones, funciones, onclick, if, textContent literal y
// console.log. Lo que no encaja se ignora (el HTML ya se convierte aparte).

function stripJsComments(src: string): string {
  let out = "";
  let i = 0;
  let quote: string | null = null;
  while (i < src.length) {
    const c = src[i];
    if (quote) {
      out += c;
      if (c === "\\") {
        out += src[i + 1] ?? "";
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      out += c;
      i++;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function takeBalanced(
  s: string,
  openIdx: number,
  open: string,
  close: string,
): { inner: string; end: number } | null {
  if (s[openIdx] !== open) return null;
  let depth = 0;
  let quote: string | null = null;
  for (let i = openIdx; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return { inner: s.slice(openIdx + 1, i), end: i };
    }
  }
  return null;
}

function splitTopLevel(src: string): string[] {
  const out: string[] = [];
  let buf = "";
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      buf += c;
      if (c === "\\") {
        buf += src[i + 1] ?? "";
        i++;
        continue;
      }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      buf += c;
      continue;
    }
    if (c === "{") {
      depth++;
      buf += c;
      continue;
    }
    if (c === "}") {
      depth--;
      buf += c;
      if (depth === 0) {
        out.push(buf.trim());
        buf = "";
      }
      continue;
    }
    if (c === ";" && depth === 0) {
      out.push(buf.trim());
      buf = "";
      continue;
    }
    buf += c;
  }
  if (buf.trim()) out.push(buf.trim());
  return out.filter(Boolean);
}

function jsStatement(stmt: string): BlockSpec | null {
  let m: RegExpMatchArray | null;

  // if (cond) { ... }
  if ((m = stmt.match(/^if\s*\(/))) {
    const par = takeBalanced(stmt, m[0].length - 1, "(", ")");
    if (par) {
      const brace = stmt.indexOf("{", par.end + 1);
      if (brace >= 0) {
        const body = takeBalanced(stmt, brace, "{", "}");
        if (body) {
          return {
            type: "bw_js_ifelse",
            fields: { COND: par.inner.trim() },
            inputs: { DO: parseJs(body.inner) },
          };
        }
      }
    }
    return null;
  }

  // function nombre() { ... }
  if ((m = stmt.match(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/))) {
    const par = takeBalanced(stmt, m[0].length - 1, "(", ")");
    if (par) {
      const brace = stmt.indexOf("{", par.end + 1);
      if (brace >= 0) {
        const body = takeBalanced(stmt, brace, "{", "}");
        if (body) {
          return {
            type: "bw_js_func",
            fields: { NAME: m[1] },
            inputs: { DO: parseJs(body.inner) },
          };
        }
      }
    }
    return null;
  }

  // id.onclick = ... { ... } (onsubmit se ignora: no hay bloque fiel)
  if (
    (m = stmt.match(
      /^(?:document\.getElementById\(\s*['"]([\w-]+)['"]\s*\)|([A-Za-z_$][\w$]*))\s*\.\s*(onclick|onsubmit)\s*=/,
    ))
  ) {
    const id = m[1] ?? m[2] ?? "";
    const brace = stmt.indexOf("{", m[0].length);
    if (brace >= 0 && m[3] === "onclick") {
      const body = takeBalanced(stmt, brace, "{", "}");
      if (body) {
        return {
          type: "bw_js_onclick",
          fields: { ID: id },
          inputs: { DO: parseJs(body.inner) },
        };
      }
    }
    return null;
  }

  // id.textContent = 'texto'
  if (
    (m = stmt.match(
      /^(?:document\.getElementById\(\s*['"]([\w-]+)['"]\s*\)|([A-Za-z_$][\w$]*))\s*\.\s*textContent\s*=\s*(['"])([\s\S]*)\3$/,
    ))
  ) {
    return {
      type: "bw_js_text",
      fields: { ID: m[1] ?? m[2] ?? "", TEXT: m[4] },
    };
  }

  // console.log(...)
  if ((m = stmt.match(/^console\.log\s*\(([\s\S]*)\)$/))) {
    let what = m[1].trim();
    const lit = what.match(/^(['"])([\s\S]*)\1$/);
    if (lit) what = lit[2];
    return { type: "bw_js_log", fields: { WHAT: what } };
  }

  // let/const/var nombre = valor;
  if ((m = stmt.match(/^(?:let|const|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([\s\S]+)$/))) {
    const name = m[1];
    const val = m[2].trim();
    if (/^\{[\s\S]*\}$/.test(val)) {
      return {
        type: "bw_js_obj",
        fields: { NAME: name, PROPS: val.slice(1, -1).trim() },
      };
    }
    const str = val.match(/^(['"])([\s\S]*)\1$/);
    if (str) return { type: "bw_js_var", fields: { NAME: name, VAL: str[2] } };
    if (/^-?\d+(?:\.\d+)?$/.test(val) || /^(true|false)$/.test(val)) {
      return { type: "bw_js_var", fields: { NAME: name, VAL: val } };
    }
    return null;
  }

  return null;
}

function parseJs(js: string): BlockSpec[] {
  const clean = stripJsComments(js).trim();
  if (!clean) return [];
  const out: BlockSpec[] = [];
  for (const stmt of splitTopLevel(clean)) {
    const spec = jsStatement(stmt);
    if (spec) out.push(spec);
  }
  return out;
}

function extractScripts(code: string): string {
  const out: string[] = [];
  const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) out.push(m[1]);
  return out.join("\n");
}

// Algunos Boss traen solo el JS suelto (sin <script>).
function jsSource(code: string): string {
  const scripts = extractScripts(code);
  if (scripts.trim()) return scripts;
  const hasHtmlTag = /<\/?[a-zA-Z][\w-]*(?:\s[^>]*)?\/?>/.test(code);
  if (
    !hasHtmlTag &&
    /(^|[^\w$])(?:let|const|var|function|if|console)(?:[^\w$]|$)|\.onclick\s*=|=>/.test(code)
  ) {
    return code;
  }
  return "";
}

function isJsSpec(s: BlockSpec): boolean {
  return s.type.startsWith("bw_js_");
}

export function codeToBlocks(code: string): BlockSpec[] {
  if (!code) return [];
  const tree = parseHtml(code);
  const specs = nodeToSpecs(tree, gatherLabels(tree));
  // Descripción de la página: si hay <meta name="description">, adjúntala al bw_head.
  const desc = code.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1];
  const iconTag = code.match(/<link\b[^>]*rel=["']icon["'][^>]*>/i)?.[0];
  const icon = iconTag?.match(/href=["']([^"']*)["']/i)?.[1];
  if (desc || icon) {
    const head = specs.find((s) => s.type === "bw_head");
    if (head) head.fields = { ...head.fields, ...(desc ? { DESC: desc } : {}), ...(icon ? { ICON: icon } : {}) };
  }
  return [...specs, ...parseJs(jsSource(code))];
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
  const base = codeToBlocks(codigoInicial);
  if (!bossCodigoRoto) return specsToXml(base);
  const boss = codeToBlocks(bossCodigoRoto);
  if (!boss.length) return specsToXml(base);
  // Boss con HTML propio → úsalo tal cual. Boss solo con JS → conserva el HTML
  // del proyecto inicial y añade la lógica rota encima.
  const bossHasNonJs = boss.some((s) => !isJsSpec(s));
  const specs = bossHasNonJs
    ? boss
    : [...base.filter((s) => !isJsSpec(s)), ...boss];
  return specsToXml(specs);
}

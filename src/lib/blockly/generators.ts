// Generadores: bloques -> HTML/CSS/JS string
// Recursivo: recorre cadenas (nextConnection) y baja por cuerpos (input_statement),
// de modo que los bloques contenedores anidan contenido real.
import type { Block } from "blockly";

function f(block: Block, name: string, fallback = ""): string {
  try {
    return (block.getFieldValue(name) as string | null) ?? fallback;
  } catch {
    return fallback;
  }
}

type Frag = { html: string; css: string; js: string };

const empty = (): Frag => ({ html: "", css: "", js: "" });
const merge = (a: Frag, b: Frag): Frag => ({
  html: a.html + b.html,
  css: a.css + b.css,
  js: a.js + b.js,
});

// Código de un cuerpo (input_statement) como fragmento.
function inner(b: Block, input: string): Frag {
  const child = b.getInputTargetBlock(input);
  return child ? chainFrag(child) : empty();
}

// Cadena de hermanos (este bloque + los siguientes), SIN subir al padre.
function chainFrag(b: Block | null): Frag {
  let out = empty();
  let cur: Block | null = b;
  let guard = 0;
  while (cur && guard++ < 5000) {
    out = merge(out, blockFrag(cur));
    cur = cur.getNextBlock();
  }
  return out;
}

function blockFrag(b: Block): Frag {
  const t = b.type;
  switch (t) {
    // ===== HTML =====
    case "bw_h": {
      const lvl = f(b, "LEVEL", "h1");
      return { ...empty(), html: `<${lvl}>${escapeHtml(f(b, "TEXT", "Título"))}</${lvl}>\n` };
    }
    case "bw_p": return { ...empty(), html: `<p>${escapeHtml(f(b, "TEXT", "Texto"))}</p>\n` };
    case "bw_a": return { ...empty(), html: `<a href="${f(b, "URL", "#")}">${escapeHtml(f(b, "TEXT", "Link"))}</a>\n` };
    case "bw_img": return { ...empty(), html: `<img src="${f(b, "URL", "")}" alt="${escapeHtml(f(b, "ALT", ""))}" />\n` };
    case "bw_button": return { ...empty(), html: `<button id="${f(b, "ID", "magia")}">${escapeHtml(f(b, "TEXT", "Click"))}</button>\n` };
    case "bw_input": return { ...empty(), html: `<label>${escapeHtml(f(b, "PH", ""))}<input id="${f(b, "ID", "x")}" type="${f(b, "TYPE", "text")}" placeholder="${escapeHtml(f(b, "PH", ""))}" /></label>\n` };
    case "bw_list": {
      const items = f(b, "ITEMS", "").split(",").map((s: string) => s.trim()).filter(Boolean);
      const kind = f(b, "KIND", "ul");
      return { ...empty(), html: `<${kind}>${items.map((i: string) => `<li>${escapeHtml(i)}</li>`).join("")}</${kind}>\n` };
    }
    case "bw_table": {
      const rows = f(b, "ROWS", "").split(",").map((s: string) => s.trim()).filter(Boolean);
      const body = rows.map((r: string) => {
        const [n, p] = r.split(":");
        return `<tr><td>${escapeHtml(n || "")}</td><td>${escapeHtml(p || "")}</td></tr>`;
      }).join("");
      return { ...empty(), html: `<table><caption>${escapeHtml(f(b, "CAP", ""))}</caption><thead><tr><th>Nombre</th><th>Puntos</th></tr></thead><tbody>${body}</tbody></table>\n` };
    }
    case "bw_form": return { ...empty(), html: `<form id="${f(b, "ID", "f")}"><input placeholder="tu nombre" required /><button>${escapeHtml(f(b, "BTN", "Enviar"))}</button></form>\n` };
    case "bw_video": return { ...empty(), html: `<video controls width="300" src="${f(b, "URL", "")}"></video>\n` };
    case "bw_details": return { ...empty(), html: `<details><summary>${escapeHtml(f(b, "SUM", "Ver"))}</summary><p>${escapeHtml(f(b, "TEXT", ""))}</p></details>\n` };
    case "bw_counter_html": return { ...empty(), html: `<h2>Puntos: <span id="${f(b, "SPAN", "n")}">0</span></h2><button id="${f(b, "BTN", "btn")}">+1</button>\n` };
    case "bw_sem": {
      const tag = ["header", "nav", "main", "section", "article", "footer", "aside"].includes(f(b, "TAG", "section")) ? f(b, "TAG", "section") : "section";
      const body = inner(b, "DO");
      return { ...body, html: `<${tag}>\n${body.html}</${tag}>\n` };
    }
    case "bw_div": {
      const body = inner(b, "DO");
      return { ...body, html: `<div>\n${body.html}</div>\n` };
    }
    case "bw_br": return { ...empty(), html: "<br>\n" };
    case "bw_hr": return { ...empty(), html: "<hr>\n" };
    case "bw_audio": return { ...empty(), html: `<audio controls src="${f(b, "URL", "")}"></audio>\n` };
    case "bw_iframe": {
      const w = f(b, "W", "300");
      const h = f(b, "H", "170");
      return { ...empty(), html: `<iframe width="${w}" height="${h}" src="${f(b, "URL", "")}" title="video incrustado" loading="lazy" allowfullscreen></iframe>\n` };
    }
    case "bw_img_asset": return { ...empty(), html: `<img data-asset="${escapeHtml(f(b, "ASSET", ""))}" src="${resolveAsset(f(b, "ASSET", ""))}" alt="${escapeHtml(f(b, "ALT", "mi foto"))}" />\n` };
    case "bw_video_asset": return { ...empty(), html: `<video controls width="300" data-asset="${escapeHtml(f(b, "ASSET", ""))}" src="${resolveAsset(f(b, "ASSET", ""))}"></video>\n` };

    // ===== CSS =====
    case "bw_css_color": return { ...empty(), css: `${f(b, "SEL", "h1")}{color:${f(b, "C", "#ff6b35")};background:${f(b, "BG", "#1a1523")};padding:12px;border-radius:12px;}\n` };
    case "bw_css_font": return { ...empty(), css: `${f(b, "SEL", "h1")}{font-size:${f(b, "SIZE", "32")}px;}\n` };
    case "bw_css_box": return { ...empty(), css: `${f(b, "SEL", ".card")}{padding:${f(b, "PAD", "16")}px;border:3px solid #1a1523;border-radius:${f(b, "RAD", "12")}px;background:white;}\n` };
    case "bw_css_flex": return { ...empty(), css: `body{display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px;}\n` };
    case "bw_css_flex2": return { ...empty(), css: `${f(b, "SEL", "body")}{display:flex;flex-direction:${f(b, "DIR", "row")};justify-content:${f(b, "JUST", "center")};align-items:${f(b, "ALIGN", "center")};gap:${f(b, "GAP", "12")}px;}\n` };
    case "bw_css_grid3": return { ...empty(), css: `.grid,.galeria,#inv{display:grid;grid-template-columns:repeat(3,1fr);gap:${f(b, "GAP", "12")}px;}\n` };
    case "bw_css_grid": return { ...empty(), css: `${f(b, "SEL", ".grid,.galeria")}{display:grid;grid-template-columns:repeat(${f(b, "COLS", "3")},1fr);gap:${f(b, "GAP", "12")}px;}\n` };
    case "bw_css_shadow": return { ...empty(), css: `div,button,.card{box-shadow:4px 4px 0 #1a1523;}\n` };
    case "bw_css_gradient": return { ...empty(), css: `body{background:linear-gradient(135deg,${f(b, "C1", "#ff6b35")},${f(b, "C2", "#a855f7")});color:white;}\n` };
    case "bw_css_badge": return { ...empty(), css: `.badge{position:absolute;top:-12px;right:-12px;background:#FF6B35;color:white;padding:4px 10px;border-radius:999px;border:2px solid #1a1523;}.card{position:relative;}\n` };
    case "bw_css_responsive": return { ...empty(), css: `@media(max-width:768px){.grid,.galeria{grid-template-columns:1fr !important;}body{padding:12px;}}\n` };
    case "bw_css_animate": return { ...empty(), css: `@keyframes salto{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}.bloqui,button{animation:salto 1.2s infinite;}\n` };
    case "bw_css_hover": return { ...empty(), css: `${f(b, "SEL", ".card")}{transition:transform .2s;}${f(b, "SEL", ".card")}:hover{transform:scale(1.05);}\n` };
    case "bw_css_center": return { ...empty(), css: `body{text-align:center;}\n` };
    case "bw_css_dark": return { ...empty(), css: `:root{--bg:#FFF8EC;--tx:#1a1523;}.dark{--bg:#12101a;--tx:#FFF8EC;}body{background:var(--bg);color:var(--tx);}\n` };
    case "bw_css_card": return { ...empty(), css: `${f(b, "SEL", ".card")}{background:white;border:4px solid #1a1523;border-radius:16px;padding:24px;box-shadow:6px 6px 0 #1a1523;}\n` };
    case "bw_css_transition": return { ...empty(), css: `${f(b, "SEL", ".card")}{transition:${f(b, "PROP", "all")} ${f(b, "TIME", ".2s")} ease;}\n` };
    case "bw_css_transform": return { ...empty(), css: `${f(b, "SEL", ".card")}{transform:${f(b, "HOW", "scale(1.05)")};}\n` };
    case "bw_css_media": {
      const body = inner(b, "DO");
      return { ...body, css: `@media(max-width:${f(b, "W", "768")}px){\n${body.css}}\n` };
    }

    // ===== JS =====
    case "bw_js_var": return { ...empty(), js: `let ${sanitizeId(f(b, "NAME", "x"))} = ${JSON.stringify(f(b, "VAL", "0"))};\n` };
    case "bw_js_counter": return { ...empty(), js: `(function(){window._p=window._p||0;const b=document.getElementById('${f(b, "BTN", "btn")}'),s=document.getElementById('${f(b, "SPAN", "n")}');if(s)s.textContent=window._p;if(b)b.onclick=()=>{window._p++;if(s)s.textContent=window._p;window.dispatchEvent(new CustomEvent('bw-puntos',{detail:window._p}));};})();\n` };
    case "bw_js_text": return { ...empty(), js: `document.getElementById('${f(b, "ID", "x")}').textContent=${JSON.stringify(f(b, "TEXT", ""))};\n` };
    case "bw_js_click": return { ...empty(), js: `document.getElementById('${f(b, "ID", "magia")}').onclick=function(){this.textContent=${JSON.stringify(f(b, "MSG", "¡Lo lograste!"))};};\n` };
    case "bw_js_if": return { ...empty(), js: `(function(){const N=${Number(f(b, "N", "10"))||10},MSG=${JSON.stringify(f(b, "MSG", "win"))};const check=()=>{if((window._p||0)>=N){if(!document.getElementById('bw-win-msg')){document.body.insertAdjacentHTML('beforeend','<p id="bw-win-msg">'+MSG+'</p>');}}};window.addEventListener('bw-puntos',check);check();})();\n` };
    case "bw_js_greet": return { ...empty(), js: `document.getElementById('${f(b, "BTN", "b")}').onclick=()=>{const v=document.getElementById('${f(b, "INP", "nom")}').value||'crack';document.getElementById('${f(b, "T", "t")}').textContent='Hola '+v+'!';};\n` };
    case "bw_js_list": return { ...empty(), js: `(function(){const items=${JSON.stringify(f(b, "ITEMS", "").split(",").map((s: string) => s.trim()))};document.getElementById('${f(b, "DIV", "inv")}').innerHTML=items.map(i=>'<div>'+i+'</div>').join('');})();\n` };
    case "bw_js_validate": return { ...empty(), js: `document.getElementById('${f(b, "F", "f")}').onsubmit=e=>{e.preventDefault();const em=document.getElementById('${f(b, "E", "e")}').value;if(!em.includes('@')){document.getElementById('${f(b, "ERR", "err")}').textContent='Email inválido';return;}document.getElementById('${f(b, "ERR", "err")}').textContent='¡Registro correcto!';};\n` };
    case "bw_js_save": return { ...empty(), js: `(function(){let best=Number(localStorage.getItem('bw-best')||0);const s=document.getElementById('${f(b, "SPAN", "r")}');if(s)s.textContent=best;document.getElementById('${f(b, "BTN", "j")}').onclick=()=>{best++;localStorage.setItem('bw-best',best);if(s)s.textContent=best;};})();\n` };
    case "bw_js_fetch": return { ...empty(), js: `document.getElementById('${f(b, "BTN", "go")}').onclick=async()=>{const o=document.getElementById('${f(b, "OUT", "out")}');o.textContent='Cargando...';try{const r=await fetch('https://pokeapi.co/api/v2/pokemon/pikachu');const d=await r.json();o.textContent='¡'+d.name+'!';}catch{o.textContent='Sin internet, intenta de nuevo';}};\n` };
    case "bw_js_log": return { ...empty(), js: `console.log(${JSON.stringify(f(b, "WHAT", "x"))});\n` };
    case "bw_js_level": return { ...empty(), js: `(function(){const show=()=>{const n=document.getElementById('${f(b, "N", "n")}');const v=n?Number(n.textContent||0):(window._p||0);if(v>=10){const m=document.getElementById('${f(b, "MSG", "msg")}');if(m)m.textContent='¡Nivel pro!';}};window.addEventListener('bw-puntos',show);show();})();\n` };
    case "bw_js_win": return { ...empty(), js: `(function(){const N=${Number(f(b, "N", "20"))||20};const win=()=>{if((window._p||0)>=N&&!document.getElementById('bw-win')){document.body.insertAdjacentHTML('beforeend','<p id="bw-win">¡GANASTE!</p>');}};window.addEventListener('bw-puntos',win);win();})();\n` };
    case "bw_js_timer": return { ...empty(), js: `setTimeout(()=>alert(${JSON.stringify(f(b, "MSG", "¡Tiempo!"))}),${(Number(f(b, "SEC", "30"))||30)*1000});\n` };
    case "bw_js_ifelse": {
      const cond = f(b, "COND", "window._p>=5");
      const then = inner(b, "DO").js;
      const els = inner(b, "ELSE").js;
      const body = els
        ? `if(${cond}){\n${then}} else {\n${els}}\n`
        : `if(${cond}){\n${then}}\n`;
      return { ...empty(), js: body };
    }
    case "bw_js_repeat": {
      const body = inner(b, "DO").js;
      return { ...empty(), js: `for(let i=0;i<${Number(f(b, "N", "3")) || 3};i++){\n${body}}\n` };
    }
    case "bw_js_func": {
      const body = inner(b, "DO").js;
      return { ...empty(), js: `function ${sanitizeId(f(b, "NAME", "miFuncion"))}(){\n${body}}\n` };
    }
    case "bw_js_call": return { ...empty(), js: `${sanitizeId(f(b, "NAME", "miFuncion"))}();\n` };
    case "bw_js_onclick": {
      const body = inner(b, "DO").js;
      return { ...empty(), js: `document.getElementById('${f(b, "ID", "btn")}').onclick=function(){\n${body}};\n` };
    }
    case "bw_js_settimeout": {
      const body = inner(b, "DO").js;
      return { ...empty(), js: `setTimeout(function(){\n${body}}, ${Number(f(b, "MS", "1000")) || 1000});\n` };
    }
    default:
      return empty();
  }
}

// Genera el código a partir de los bloques raíz (top blocks) del workspace.
export function generateFromBlocks(topBlocks: Block[]): { html: string; css: string; js: string } {
  let out = empty();
  for (const b of topBlocks) {
    out = merge(out, chainFrag(b));
  }
  return { html: out.html, css: out.css, js: out.js };
}

function escapeHtml(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sanitizeId(s: string): string {
  return String(s).replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 30) || "x";
}

// Resuelve assetId -> data URL (cargan en iframes sandbox opacos; los blob: están
// prohibidos ahí). Sin romper SSR. Ver primeDataUrls() en lib/assets.
function resolveAsset(id: string): string {
  try {
    const g = globalThis as unknown as { __bw_urls?: Record<string, string> };
    const map = g.__bw_urls;
    if (map && map[id]) return map[id];
  } catch {}
  return "";
}

// Reemplaza data-asset con URLs frescas (llamar tras generar, con cachedUrls())
export function hydrateAssets(html: string, urls: Record<string, string>): string {
  let out = html;
  for (const [id, url] of Object.entries(urls)) {
    out = out.split(`data-asset="${id}" src=""`).join(`data-asset="${id}" src="${url}"`);
    out = out.split(`data-asset="${id}"`).join(`data-asset="${id}"`);
    // si el src quedó vacío pero tenemos url, inyéctalo
    out = out.replace(new RegExp(`data-asset="${escapeReg(id)}" src=""`, "g"), `data-asset="${id}" src="${url}"`);
  }
  return out;
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Hoja base BLOCKWEB: da aspecto decente sin ensuciar el HTML generado con estilos inline.
const BASE_CSS = `*{box-sizing:border-box}
body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;margin:0;padding:16px;background:#fff8ec;color:#1a1523;line-height:1.5}
h1,h2,h3{line-height:1.15}
img,video,iframe{max-width:100%;border-radius:12px}
button{padding:12px 20px;border-radius:12px;border:3px solid #1a1523;background:#FFC700;font-weight:800;color:#1a1523;cursor:pointer;font:inherit}
input,select,textarea,label{padding:8px;border-radius:8px;border:2px solid #1a1523;font:inherit}
label{display:inline-flex;gap:6px;align-items:center}
table{border-collapse:collapse}
th,td{border:2px solid #1a1523;padding:6px 10px}
a{color:#2563EB}`;

export function combineSrcDoc(html: string, css: string, js: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${BASE_CSS}\n${css}</style></head><body>${html || "<p style='opacity:.6'>Arrastra bloques</p>"}<script>${js}<\/script></body></html>`;
}

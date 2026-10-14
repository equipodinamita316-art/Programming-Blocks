// Generadores: bloque -> HTML/CSS/JS string
import type { Block } from "blockly";

function f(block: Block, name: string, fallback = ""): string {
  try {
    return (block.getFieldValue(name) as string | null) ?? fallback;
  } catch {
    return fallback;
  }
}

export function generateFromBlocks(blocks: Block[]): { html: string; css: string; js: string } {
  let html = "";
  let css = "";
  let js = "";

  for (const b of blocks) {
    const t = b.type;
    switch (t) {
      // HTML
      case "bw_h": html += `<${f(b, "LEVEL", "h1")}>${escapeHtml(f(b, "TEXT", "Título"))}</${f(b, "LEVEL", "h1")}>\n`; break;
      case "bw_p": html += `<p>${escapeHtml(f(b, "TEXT", "Texto"))}</p>\n`; break;
      case "bw_a": html += `<a href="${f(b, "URL", "#")}">${escapeHtml(f(b, "TEXT", "Link"))}</a>\n`; break;
      case "bw_img": html += `<img src="${f(b, "URL", "")}" alt="${escapeHtml(f(b, "ALT", ""))}" style="border-radius:12px;max-width:100%" />\n`; break;
      case "bw_button": html += `<button id="${f(b, "ID", "magia")}" style="padding:12px 20px;border-radius:12px;border:3px solid #1a1523;background:#FFC700;font-weight:800">${escapeHtml(f(b, "TEXT", "Click"))}</button>\n`; break;
      case "bw_input": html += `<label>${escapeHtml(f(b, "PH", ""))}: <input id="${f(b, "ID", "x")}" type="${f(b, "TYPE", "text")}" placeholder="${escapeHtml(f(b, "PH", ""))}" style="padding:8px;border-radius:8px;border:2px solid #1a1523" /></label>\n`; break;
      case "bw_list": {
        const items = f(b, "ITEMS", "").split(",").map((s: string) => s.trim()).filter(Boolean);
        const kind = f(b, "KIND", "ul");
        html += `<${kind}>${items.map((i: string) => `<li>${escapeHtml(i)}</li>`).join("")}</${kind}>\n`;
        break;
      }
      case "bw_table": {
        const rows = f(b, "ROWS", "").split(",").map((s: string) => s.trim()).filter(Boolean);
        html += `<table border="1" style="border-collapse:collapse"><caption>${escapeHtml(f(b, "CAP", ""))}</caption><thead><tr><th>Nombre</th><th>Puntos</th></tr></thead><tbody>${rows.map((r: string) => { const [n, p] = r.split(":"); return `<tr><td>${escapeHtml(n || "")}</td><td>${escapeHtml(p || "")}</td></tr>`; }).join("")}</tbody></table>\n`;
        break;
      }
      case "bw_form": html += `<form id="${f(b, "ID", "f")}"><input placeholder="tu nombre" required style="padding:8px;border-radius:8px;border:2px solid #1a1523" /><button>${escapeHtml(f(b, "BTN", "Enviar"))}</button></form>\n`; break;
      case "bw_video": html += `<video controls width="300" src="${f(b, "URL", "")}"></video>\n`; break;
      case "bw_details": html += `<details><summary>${escapeHtml(f(b, "SUM", "Ver"))}</summary><p>${escapeHtml(f(b, "TEXT", ""))}</p></details>\n`; break;
      case "bw_counter_html": html += `<h2>Puntos: <span id="${f(b, "SPAN", "n")}">0</span></h2><button id="${f(b, "BTN", "btn")}">+1</button>\n`; break;
      case "bw_sem": { const tag = ["header","nav","main","section","article","footer"].includes(f(b, "TAG", "section")) ? f(b, "TAG", "section") : "section"; html += `<${tag}><p>${escapeHtml(f(b, "TEXT", ""))}</p></${tag}>\n`; break; }
      case "bw_img_asset": html += `<img data-asset="${escapeHtml(f(b, "ASSET", ""))}" src="${resolveAsset(f(b, "ASSET", ""))}" alt="${escapeHtml(f(b, "ALT", "mi foto"))}" style="border-radius:12px;max-width:100%" />\n`; break;
      case "bw_video_asset": html += `<video controls width="300" data-asset="${escapeHtml(f(b, "ASSET", ""))}" src="${resolveAsset(f(b, "ASSET", ""))}"></video>\n`; break;

      // CSS
      case "bw_css_color": css += `${f(b, "SEL", "h1")}{color:${f(b, "C", "#ff6b35")};background:${f(b, "BG", "#1a1523")};padding:12px;border-radius:12px;}\n`; break;
      case "bw_css_font": css += `${f(b, "SEL", "h1")}{font-size:${f(b, "SIZE", "32")}px;}\n`; break;
      case "bw_css_box": css += `${f(b, "SEL", ".card")}{padding:${f(b, "PAD", "16")}px;border:3px solid #1a1523;border-radius:${f(b, "RAD", "12")}px;background:white;}\n`; break;
      case "bw_css_flex": css += `body{display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px;}\n`; break;
      case "bw_css_grid3": css += `.grid,.galeria,#inv{display:grid;grid-template-columns:repeat(3,1fr);gap:${f(b, "GAP", "12")}px;}\n`; break;
      case "bw_css_shadow": css += `div,button,.card{box-shadow:4px 4px 0 #1a1523;}\n`; break;
      case "bw_css_gradient": css += `body{background:linear-gradient(135deg,${f(b, "C1", "#ff6b35")},${f(b, "C2", "#a855f7")});color:white;}\n`; break;
      case "bw_css_badge": css += `.badge{position:absolute;top:-12px;right:-12px;background:#FF6B35;color:white;padding:4px 10px;border-radius:999px;border:2px solid #1a1523;}.card{position:relative;}\n`; break;
      case "bw_css_responsive": css += `@media(max-width:768px){.grid,.galeria{grid-template-columns:1fr !important;}body{padding:12px;}}\n`; break;
      case "bw_css_animate": css += `@keyframes salto{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}.bloqui,button{animation:salto 1.2s infinite;}\n`; break;
      case "bw_css_hover": css += `${f(b, "SEL", ".card")}{transition:transform .2s;}${f(b, "SEL", ".card")}:hover{transform:scale(1.05);}\n`; break;
      case "bw_css_center": css += `body{text-align:center;}\n`; break;
      case "bw_css_dark": css += `:root{--bg:#FFF8EC;--tx:#1a1523;}.dark{--bg:#12101a;--tx:#FFF8EC;}body{background:var(--bg);color:var(--tx);}\n`; break;
      case "bw_css_card": css += `${f(b, "SEL", ".card")}{background:white;border:4px solid #1a1523;border-radius:16px;padding:24px;box-shadow:6px 6px 0 #1a1523;}\n`; break;

      // JS
      case "bw_js_var": js += `let ${sanitizeId(f(b, "NAME", "x"))} = ${JSON.stringify(f(b, "VAL", "0"))};\n`; break;
      case "bw_js_counter": js += `(function(){window._p=window._p||0;const b=document.getElementById('${f(b, "BTN", "btn")}'),s=document.getElementById('${f(b, "SPAN", "n")}');if(s)s.textContent=window._p;if(b)b.onclick=()=>{window._p++;if(s)s.textContent=window._p;window.dispatchEvent(new CustomEvent('bw-puntos',{detail:window._p}));};})();\n`; break;
      case "bw_js_text": js += `document.getElementById('${f(b, "ID", "x")}').textContent=${JSON.stringify(f(b, "TEXT", ""))};\n`; break;
      case "bw_js_click": js += `document.getElementById('${f(b, "ID", "magia")}').onclick=function(){this.textContent=${JSON.stringify(f(b, "MSG", "🎉"))};};\n`; break;
      case "bw_js_if": js += `(function(){const N=${Number(f(b, "N", "10"))||10},MSG=${JSON.stringify(f(b, "MSG", "win"))};const check=()=>{if((window._p||0)>=N){if(!document.getElementById('bw-win-msg')){document.body.insertAdjacentHTML('beforeend','<p id="bw-win-msg">'+MSG+'</p>');}}};window.addEventListener('bw-puntos',check);check();})();\n`; break;
      case "bw_js_greet": js += `document.getElementById('${f(b, "BTN", "b")}').onclick=()=>{const v=document.getElementById('${f(b, "INP", "nom")}').value||'crack';document.getElementById('${f(b, "T", "t")}').textContent='Hola '+v+' 🎉';};\n`; break;
      case "bw_js_list": js += `(function(){const items=${JSON.stringify(f(b, "ITEMS", "").split(",").map((s: string) => s.trim()))};document.getElementById('${f(b, "DIV", "inv")}').innerHTML=items.map(i=>'<div>'+i+'</div>').join('');})();\n`; break;
      case "bw_js_validate": js += `document.getElementById('${f(b, "F", "f")}').onsubmit=e=>{e.preventDefault();const em=document.getElementById('${f(b, "E", "e")}').value;if(!em.includes('@')){document.getElementById('${f(b, "ERR", "err")}').textContent='❌ Email inválido';return;}document.getElementById('${f(b, "ERR", "err")}').textContent='✅ ¡Pro!';};\n`; break;
      case "bw_js_save": js += `(function(){let best=Number(localStorage.getItem('bw-best')||0);const s=document.getElementById('${f(b, "SPAN", "r")}');if(s)s.textContent=best;document.getElementById('${f(b, "BTN", "j")}').onclick=()=>{best++;localStorage.setItem('bw-best',best);if(s)s.textContent=best;};})();\n`; break;
      case "bw_js_fetch": js += `document.getElementById('${f(b, "BTN", "go")}').onclick=async()=>{const o=document.getElementById('${f(b, "OUT", "out")}');o.textContent='⏳...';try{const r=await fetch('https://pokeapi.co/api/v2/pokemon/pikachu');const d=await r.json();o.textContent='⚡ '+d.name;}catch{o.textContent='❌ Sin internet';}};\n`; break;
      case "bw_js_log": js += `console.log(${JSON.stringify(f(b, "WHAT", "x"))});\n`; break;
      case "bw_js_level": js += `(function(){const show=()=>{const n=document.getElementById('${f(b, "N", "n")}');const v=n?Number(n.textContent||0):(window._p||0);if(v>=10){const m=document.getElementById('${f(b, "MSG", "msg")}');if(m)m.textContent='🔥 Nivel pro';}};window.addEventListener('bw-puntos',show);show();})();\n`; break;
      case "bw_js_win": js += `(function(){const N=${Number(f(b, "N", "20"))||20};const win=()=>{if((window._p||0)>=N&&!document.getElementById('bw-win')){document.body.insertAdjacentHTML('beforeend','<p id="bw-win">🏆 ¡GANASTE!</p>');}};window.addEventListener('bw-puntos',win);win();})();\n`; break;
      case "bw_js_timer": js += `setTimeout(()=>alert(${JSON.stringify(f(b, "MSG", "¡Tiempo!"))}),${(Number(f(b, "SEC", "30"))||30)*1000});\n`; break;
    }
  }

  return { html, css, js };
}

function escapeHtml(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sanitizeId(s: string): string {
  return String(s).replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 30) || "x";
}

// Resuelve assetId -> object URL registrada por lib/assets (sin romper SSR)
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

export function combineSrcDoc(html: string, css: string, js: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;padding:16px;}${css}</style></head><body>${html || "<p style='opacity:.6'>Arrastra bloques 🧱</p>"}<script>${js}<\/script></body></html>`;
}

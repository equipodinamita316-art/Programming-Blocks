// Definiciones de 40+ bloques BLOCKWEB en español
// Cada bloque genera HTML/CSS/JS vía generators.ts

export const BLOCK_DEFS: Array<Record<string, unknown>> = [
  // ===== HTML 12 =====
  { type: "bw_h", message0: "🧱 título %1 texto %2", args0: [{ type: "field_dropdown", name: "LEVEL", options: [["h1", "h1"], ["h2", "h2"], ["h3", "h3"]] }, { type: "field_input", name: "TEXT", text: "Mi página gamer" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Título" },
  { type: "bw_p", message0: "🧱 párrafo %1", args0: [{ type: "field_input", name: "TEXT", text: "Amo crear webs" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_a", message0: "🧱 enlace texto %1 url %2", args0: [{ type: "field_input", name: "TEXT", text: "Mi juego" }, { type: "field_input", name: "URL", text: "https://example.com" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_img", message0: "🧱 imagen url %1 alt %2", args0: [{ type: "field_input", name: "URL", text: "https://placehold.co/300x150" }, { type: "field_input", name: "ALT", text: "mi obra" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_button", message0: "🧱 botón id %1 texto %2", args0: [{ type: "field_input", name: "ID", text: "magia" }, { type: "field_input", name: "TEXT", text: "¡Magia!" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_input", message0: "🧱 campo id %1 tipo %2 texto %3", args0: [{ type: "field_input", name: "ID", text: "nombre" }, { type: "field_dropdown", name: "TYPE", options: [["texto", "text"], ["email", "email"], ["password", "password"], ["number", "number"]] }, { type: "field_input", name: "PH", text: "Tu nick" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_list", message0: "🧱 lista %1 items (coma) %2", args0: [{ type: "field_dropdown", name: "KIND", options: [["puntos", "ul"], ["números", "ol"]] }, { type: "field_input", name: "ITEMS", text: "Espada, Escudo, Poción" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_table", message0: "🧱 tabla título %1 filas ej A:100,B:90 %2", args0: [{ type: "field_input", name: "CAP", text: "Torneo" }, { type: "field_input", name: "ROWS", text: "Alex:100,Bloqui:95" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_form", message0: "🧱 formulario id %1 con botón %2", args0: [{ type: "field_input", name: "ID", text: "f" }, { type: "field_input", name: "BTN", text: "Enviar" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_video", message0: "🧱 video url %1", args0: [{ type: "field_input", name: "URL", text: "https://www.w3schools.com/html/mov_bbb.mp4" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_details", message0: "🧱 desplegable título %1 texto %2", args0: [{ type: "field_input", name: "SUM", text: "Ver más" }, { type: "field_input", name: "TEXT", text: "Mi secreto gamer" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_counter_html", message0: "🧱 marcador puntos id %1 botón id %2", args0: [{ type: "field_input", name: "SPAN", text: "n" }, { type: "field_input", name: "BTN", text: "btn" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_sem", message0: "🧱 sección %1 título %2", args0: [{ type: "field_dropdown", name: "TAG", options: [["cabecera", "header"], ["navegación", "nav"], ["contenido", "main"], ["sección", "section"], ["artículo", "article"], ["pie", "footer"]] }, { type: "field_input", name: "TEXT", text: "Mi contenido" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Estructura semántica" },
  // ===== 📁 Assets (subidos por el jugador) =====
  { type: "bw_img_asset", message0: "📁 imagen mía id %1 alt %2", args0: [{ type: "field_input", name: "ASSET", text: "sube en 📁" }, { type: "field_input", name: "ALT", text: "mi foto" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Usa una imagen subida en Mis archivos" },
  { type: "bw_video_asset", message0: "📁 video mío id %1", args0: [{ type: "field_input", name: "ASSET", text: "sube en 📁" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Usa un video subido en Mis archivos" },

  // ===== CSS 14 =====
  { type: "bw_css_color", message0: "🎨 color selector %1 texto %2 fondo %3", args0: [{ type: "field_input", name: "SEL", text: "h1" }, { type: "field_colour", name: "C", colour: "#ff6b35" }, { type: "field_colour", name: "BG", colour: "#1a1523" }], previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_font", message0: "🎨 fuente selector %1 tamaño %2", args0: [{ type: "field_input", name: "SEL", text: "h1" }, { type: "field_dropdown", name: "SIZE", options: [["16", "16"], ["24", "24"], ["32", "32"], ["48", "48"], ["64", "64"]] }], previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_box", message0: "🎨 caja selector %1 relleno %2 radio %3", args0: [{ type: "field_input", name: "SEL", text: ".card" }, { type: "field_dropdown", name: "PAD", options: [["8", "8"], ["16", "16"], ["24", "24"], ["32", "32"]] }, { type: "field_dropdown", name: "RAD", options: [["8", "8"], ["12", "12"], ["20", "20"]] }], previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_flex", message0: "🎨 centrar con flex", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_grid3", message0: "🎨 rejilla 3 columnas gap %1", args0: [{ type: "field_dropdown", name: "GAP", options: [["8", "8"], ["12", "12"], ["16", "16"]] }], previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_shadow", message0: "🎨 sombra dura", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_gradient", message0: "🎨 degradado %1 a %2", args0: [{ type: "field_colour", name: "C1", colour: "#ff6b35" }, { type: "field_colour", name: "C2", colour: "#a855f7" }], previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_badge", message0: "🎨 insignia flotante", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_responsive", message0: "🎨 responsive móvil 1 col", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_animate", message0: "🎨 animar salto", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_hover", message0: "🎨 hover agranda selector %1", args0: [{ type: "field_input", name: "SEL", text: ".card" }], previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_center", message0: "🎨 centrar texto", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_dark", message0: "🌙 modo oscuro con variables", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_card", message0: "🎨 tarjeta brutal selector %1", args0: [{ type: "field_input", name: "SEL", text: ".card" }], previousStatement: "Css", nextStatement: "Css", colour: 210 },

  // ===== JS 14 =====
  { type: "bw_js_var", message0: "⚡ variable %1 = %2", args0: [{ type: "field_input", name: "NAME", text: "puntos" }, { type: "field_input", name: "VAL", text: "0" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_counter", message0: "⚡ contador botón %1 muestra %2", args0: [{ type: "field_input", name: "BTN", text: "btn" }, { type: "field_input", name: "SPAN", text: "n" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_text", message0: "⚡ cambiar texto id %1 a %2", args0: [{ type: "field_input", name: "ID", text: "titulo" }, { type: "field_input", name: "TEXT", text: "🎉 ¡Nivel!" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_click", message0: "⚡ al click en %1 celebrar %2", args0: [{ type: "field_input", name: "ID", text: "magia" }, { type: "field_input", name: "MSG", text: "🎉 ¡Lo lograste!" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_if", message0: "⚡ si puntos >= %1 mostrar %2", args0: [{ type: "field_input", name: "N", text: "10" }, { type: "field_input", name: "MSG", text: "🏆 ¡Ganaste!" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_greet", message0: "⚡ saludar input %1 título %2 botón %3", args0: [{ type: "field_input", name: "INP", text: "nom" }, { type: "field_input", name: "T", text: "t" }, { type: "field_input", name: "BTN", text: "b" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_list", message0: "⚡ pintar lista en %1 items %2", args0: [{ type: "field_input", name: "DIV", text: "inv" }, { type: "field_input", name: "ITEMS", text: "🗡️,🛡️,🧪" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_validate", message0: "⚡ validar form %1 email %2 pass %3 error %4", args0: [{ type: "field_input", name: "F", text: "f" }, { type: "field_input", name: "E", text: "e" }, { type: "field_input", name: "P", text: "p" }, { type: "field_input", name: "ERR", text: "err" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_save", message0: "⚡ guardar récord botón %1 muestra %2", args0: [{ type: "field_input", name: "BTN", text: "j" }, { type: "field_input", name: "SPAN", text: "r" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_fetch", message0: "⚡ traer pokémon en %1 botón %2", args0: [{ type: "field_input", name: "OUT", text: "out" }, { type: "field_input", name: "BTN", text: "go" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_log", message0: "⚡ depurar ver %1", args0: [{ type: "field_input", name: "WHAT", text: "puntos" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_level", message0: "⚡ niveles 10/20 en %1 msg %2", args0: [{ type: "field_input", name: "N", text: "n" }, { type: "field_input", name: "MSG", text: "msg" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_win", message0: "🏆 victoria al llegar a %1", args0: [{ type: "field_input", name: "N", text: "20" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_timer", message0: "⏱️ temporizador %1 seg mensaje %2", args0: [{ type: "field_input", name: "SEC", text: "30" }, { type: "field_input", name: "MSG", text: "¡Tiempo!" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
];

export const BLOCK_COUNT = BLOCK_DEFS.length;

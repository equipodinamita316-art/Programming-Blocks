// Definiciones de 40+ bloques BLOCKWEB en español
// Cada bloque genera HTML/CSS/JS vía generators.ts

import { BW_ICONS, fieldImage } from "./blockIcons";

const RAW_DEFS: Array<Record<string, unknown>> = [
  // ===== HTML 22 =====
  { type: "bw_h", message0: "título %1 id %2 texto %3", args0: [{ type: "field_dropdown", name: "LEVEL", options: [["h1", "h1"], ["h2", "h2"], ["h3", "h3"]] }, { type: "field_input", name: "ID", text: "" }, { type: "field_input", name: "TEXT", text: "Mi página gamer" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Título (id opcional para apuntarle con JS)" },
  { type: "bw_p", message0: "párrafo %1 id %2", args0: [{ type: "field_input", name: "TEXT", text: "Amo crear webs" }, { type: "field_input", name: "ID", text: "" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_a", message0: "enlace texto %1 url %2", args0: [{ type: "field_input", name: "TEXT", text: "Mi juego" }, { type: "field_input", name: "URL", text: "https://example.com" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_img", message0: "imagen url %1 alt %2", args0: [{ type: "field_input", name: "URL", text: "https://placehold.co/300x150" }, { type: "field_input", name: "ALT", text: "mi obra" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_button", message0: "botón id %1 texto %2", args0: [{ type: "field_input", name: "ID", text: "magia" }, { type: "field_input", name: "TEXT", text: "¡Magia!" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_input", message0: "campo id %1 label %2 tipo %3 obligatorio %4 pista %5", args0: [{ type: "field_input", name: "ID", text: "nombre" }, { type: "field_input", name: "LABEL", text: "Tu nick" }, { type: "field_dropdown", name: "TYPE", options: [["texto", "text"], ["email", "email"], ["password", "password"], ["number", "number"], ["teléfono", "tel"], ["fecha", "date"], ["color", "color"]] }, { type: "field_checkbox", name: "REQUIRED", checked: true }, { type: "field_input", name: "PH", text: "Escribe aquí" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Campo con label conectado y validación HTML" },
  { type: "bw_select", message0: "desplegable id %1 label %2 opciones (coma) %3", args0: [{ type: "field_input", name: "ID", text: "lvl" }, { type: "field_input", name: "LABEL", text: "Nivel" }, { type: "field_input", name: "OPTS", text: "Novato, Pro" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Lista desplegable" },
  { type: "bw_checkbox", message0: "casilla id %1 label %2 obligatoria %3", args0: [{ type: "field_input", name: "ID", text: "acepto" }, { type: "field_input", name: "LABEL", text: "Acepto los términos" }, { type: "field_checkbox", name: "REQUIRED", checked: true }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Casilla de verificación" },
  { type: "bw_list", message0: "lista %1 items (coma) %2", args0: [{ type: "field_dropdown", name: "KIND", options: [["puntos", "ul"], ["números", "ol"]] }, { type: "field_input", name: "ITEMS", text: "Espada, Escudo, Poción" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_table", message0: "tabla título %1 filas ej A:100,B:90 %2", args0: [{ type: "field_input", name: "CAP", text: "Torneo" }, { type: "field_input", name: "ROWS", text: "Alex:100,Bloqui:95" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_table_pro", message0: "tabla pro título %1 columnas %2 filas ej A:1,B:2 %3 banda %4 pie %5", args0: [{ type: "field_input", name: "CAP", text: "Torneo" }, { type: "field_input", name: "COLS", text: "Nombre,Puntos" }, { type: "field_input", name: "ROWS", text: "Alex:100,Bloqui:95" }, { type: "field_input", name: "SPAN", text: "Ronda final" }, { type: "field_input", name: "FOOT", text: "Total: 195" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Tabla con celda ancha (colspan) y pie (tfoot)" },
  { type: "bw_form", message0: "formulario id %1 con botón %2 %3", args0: [{ type: "field_input", name: "ID", text: "f" }, { type: "field_input", name: "BTN", text: "Enviar" }, { type: "input_statement", name: "DO", check: "Html" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Mete campos dentro del formulario" },
  { type: "bw_fieldset", message0: "grupo con leyenda %1 %2", args0: [{ type: "field_input", name: "LEGEND", text: "Datos" }, { type: "input_statement", name: "DO", check: "Html" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "fieldset + legend: mete campos dentro" },
  { type: "bw_video", message0: "video url %1 portada %2", args0: [{ type: "field_input", name: "URL", text: "https://www.w3schools.com/html/mov_bbb.mp4" }, { type: "field_input", name: "POSTER", text: "" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "poster = imagen de portada" },
  { type: "bw_details", message0: "desplegable título %1 texto %2", args0: [{ type: "field_input", name: "SUM", text: "Ver más" }, { type: "field_input", name: "TEXT", text: "Mi secreto gamer" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_counter_html", message0: "marcador puntos id %1 botón id %2", args0: [{ type: "field_input", name: "SPAN", text: "n" }, { type: "field_input", name: "BTN", text: "btn" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_sem", message0: "sección %1 %2", args0: [{ type: "field_dropdown", name: "TAG", options: [["cabecera", "header"], ["navegación", "nav"], ["contenido", "main"], ["sección", "section"], ["artículo", "article"], ["pie", "footer"], ["lateral", "aside"]] }, { type: "input_statement", name: "DO", check: "Html" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Estructura semántica: mete bloques dentro" },
  { type: "bw_div", message0: "bloque div id %1 %2", args0: [{ type: "field_input", name: "ID", text: "" }, { type: "input_statement", name: "DO", check: "Html" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Contenedor genérico (id opcional para JS): mete bloques dentro" },
  { type: "bw_br", message0: "salto de línea", previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_hr", message0: "línea separadora", previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_audio", message0: "audio url %1", args0: [{ type: "field_input", name: "URL", text: "https://www.w3schools.com/html/horse.mp3" }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_iframe", message0: "iframe url %1 ancho %2 alto %3", args0: [{ type: "field_input", name: "URL", text: "https://www.youtube.com/embed/dQw4w9WgXcQ" }, { type: "field_dropdown", name: "W", options: [["300", "300"], ["480", "480"], ["560", "560"]] }, { type: "field_dropdown", name: "H", options: [["170", "170"], ["270", "270"], ["315", "315"]] }], previousStatement: "Html", nextStatement: "Html", colour: 16 },
  { type: "bw_head", message0: "página título %1 descripción %2 favicon %3 og:title %4", args0: [{ type: "field_input", name: "TITLE", text: "Mi tienda gamer" }, { type: "field_input", name: "DESC", text: "La mejor tienda hecha por mí" }, { type: "field_input", name: "ICON", text: "" }, { type: "field_input", name: "OG", text: "" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Título, descripción, favicon y og:title que leen Google y las redes" },
  { type: "bw_progress", message0: "barra de progreso %1 de %2", args0: [{ type: "field_input", name: "VAL", text: "70" }, { type: "field_dropdown", name: "MAX", options: [["100", "100"], ["10", "10"], ["5", "5"]] }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Barra de progreso" },
  // ===== 📁 Assets (subidos por el jugador) =====
  { type: "bw_img_asset", message0: "imagen mía id %1 alt %2", args0: [{ type: "field_input", name: "ASSET", text: "sube en Archivos" }, { type: "field_input", name: "ALT", text: "mi foto" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Usa una imagen subida en Mis archivos" },
  { type: "bw_video_asset", message0: "video mío id %1", args0: [{ type: "field_input", name: "ASSET", text: "sube en Archivos" }], previousStatement: "Html", nextStatement: "Html", colour: 16, tooltip: "Usa un video subido en Mis archivos" },

  // ===== CSS 23 =====
  { type: "bw_css_color", message0: "color selector %1 texto %2 fondo %3", args0: [{ type: "field_input", name: "SEL", text: "h1" }, { type: "field_colour", name: "C", colour: "#ff6b35" }, { type: "field_colour", name: "BG", colour: "#1a1523" }], previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_font", message0: "fuente selector %1 tamaño %2", args0: [{ type: "field_input", name: "SEL", text: "h1" }, { type: "field_dropdown", name: "SIZE", options: [["16", "16"], ["24", "24"], ["32", "32"], ["48", "48"], ["64", "64"]] }], previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_box", message0: "caja selector %1 relleno %2 radio %3", args0: [{ type: "field_input", name: "SEL", text: ".card" }, { type: "field_dropdown", name: "PAD", options: [["8", "8"], ["16", "16"], ["24", "24"], ["32", "32"]] }, { type: "field_dropdown", name: "RAD", options: [["8", "8"], ["12", "12"], ["20", "20"]] }], previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_flex", message0: "centrar con flex", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_grid3", message0: "rejilla 3 columnas gap %1", args0: [{ type: "field_dropdown", name: "GAP", options: [["8", "8"], ["12", "12"], ["16", "16"]] }], previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_shadow", message0: "sombra dura", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_gradient", message0: "degradado %1 a %2", args0: [{ type: "field_colour", name: "C1", colour: "#ff6b35" }, { type: "field_colour", name: "C2", colour: "#a855f7" }], previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_badge", message0: "insignia flotante", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_responsive", message0: "responsive móvil 1 col", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_animate", message0: "animar salto", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_hover", message0: "hover agranda selector %1", args0: [{ type: "field_input", name: "SEL", text: ".card" }], previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_center", message0: "centrar texto", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_dark", message0: "modo oscuro con variables", previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_card", message0: "tarjeta brutal selector %1", args0: [{ type: "field_input", name: "SEL", text: ".card" }], previousStatement: "Css", nextStatement: "Css", colour: 210 },
  { type: "bw_css_flex2", message0: "flex selector %1 dirección %2 eje %3 cruz %4 gap %5", args0: [{ type: "field_input", name: "SEL", text: "body" }, { type: "field_dropdown", name: "DIR", options: [["fila", "row"], ["columna", "column"]] }, { type: "field_dropdown", name: "JUST", options: [["inicio", "flex-start"], ["centro", "center"], ["extremos", "space-between"], ["alrededor", "space-around"]] }, { type: "field_dropdown", name: "ALIGN", options: [["inicio", "flex-start"], ["centro", "center"], ["fin", "flex-end"], ["estirar", "stretch"]] }, { type: "field_dropdown", name: "GAP", options: [["8", "8"], ["12", "12"], ["16", "16"], ["24", "24"]] }], previousStatement: "Css", nextStatement: "Css", colour: 210, tooltip: "Flexbox a tu gusto" },
  { type: "bw_css_grid", message0: "grid selector %1 columnas %2 gap %3", args0: [{ type: "field_input", name: "SEL", text: ".grid,.galeria" }, { type: "field_dropdown", name: "COLS", options: [["2", "2"], ["3", "3"], ["4", "4"]] }, { type: "field_dropdown", name: "GAP", options: [["8", "8"], ["12", "12"], ["16", "16"], ["24", "24"]] }], previousStatement: "Css", nextStatement: "Css", colour: 210, tooltip: "Rejilla con columnas iguales" },
  { type: "bw_css_transition", message0: "transición selector %1 propiedad %2 tiempo %3", args0: [{ type: "field_input", name: "SEL", text: ".card" }, { type: "field_dropdown", name: "PROP", options: [["todo", "all"], ["transformar", "transform"], ["color", "color"], ["fondo", "background"]] }, { type: "field_dropdown", name: "TIME", options: [["0.2s", ".2s"], ["0.3s", ".3s"], ["0.5s", ".5s"]] }], previousStatement: "Css", nextStatement: "Css", colour: 210, tooltip: "Suaviza los cambios" },
  { type: "bw_css_transform", message0: "transformar selector %1 efecto %2", args0: [{ type: "field_input", name: "SEL", text: ".card" }, { type: "field_dropdown", name: "HOW", options: [["agrandar 1.05", "scale(1.05)"], ["agrandar 1.2", "scale(1.2)"], ["rotar -3°", "rotate(-3deg)"], ["subir", "translateY(-6px)"], ["mover a la derecha", "translateX(8px)"]] }], previousStatement: "Css", nextStatement: "Css", colour: 210, tooltip: "Transforma el elemento" },
  { type: "bw_css_media", message0: "media móvil hasta %1 px %2", args0: [{ type: "field_input", name: "W", text: "768" }, { type: "input_statement", name: "DO", check: "Css" }], previousStatement: "Css", nextStatement: "Css", colour: 210, tooltip: "Reglas que solo aplican en pantallas pequeñas" },
  { type: "bw_css_sticky", message0: "menú fijo al hacer scroll selector %1 desde %2 px", args0: [{ type: "field_input", name: "SEL", text: "nav" }, { type: "field_dropdown", name: "TOP", options: [["0", "0"], ["8", "8"], ["16", "16"]] }], previousStatement: "Css", nextStatement: "Css", colour: 210, tooltip: "Se pega arriba al hacer scroll" },
  { type: "bw_css_wrap", message0: "permitir salto de línea selector %1 modo %2", args0: [{ type: "field_input", name: "SEL", text: ".galeria" }, { type: "field_dropdown", name: "MODE", options: [["sí (wrap)", "wrap"], ["no (nowrap)", "nowrap"]] }], previousStatement: "Css", nextStatement: "Css", colour: 210, tooltip: "flex-wrap: las tarjetas bajan de línea" },
  { type: "bw_css_nth", message0: "resaltar selector %1 cada %2 fondo %3", args0: [{ type: "field_input", name: "SEL", text: "li" }, { type: "field_dropdown", name: "N", options: [["impar", "odd"], ["par", "even"], ["2", "2"], ["cada 3", "3"], ["2n+1", "2n+1"]] }, { type: "field_colour", name: "BG", colour: "#FFC700" }], previousStatement: "Css", nextStatement: "Css", colour: 210, tooltip: "nth-child: filas alternas" },
  { type: "bw_css_radial", message0: "degradado radial %1 a %2", args0: [{ type: "field_colour", name: "C1", colour: "#FFC700" }, { type: "field_colour", name: "C2", colour: "#FF6B35" }], previousStatement: "Css", nextStatement: "Css", colour: 210, tooltip: "radial-gradient: foco de luz" },

  // ===== JS 26 =====
  { type: "bw_js_var", message0: "variable %1 = %2", args0: [{ type: "field_input", name: "NAME", text: "puntos" }, { type: "field_input", name: "VAL", text: "0" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_counter", message0: "contador botón %1 muestra %2", args0: [{ type: "field_input", name: "BTN", text: "btn" }, { type: "field_input", name: "SPAN", text: "n" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_text", message0: "cambiar texto id %1 a %2", args0: [{ type: "field_input", name: "ID", text: "titulo" }, { type: "field_input", name: "TEXT", text: "¡Nivel!" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_click", message0: "al click en %1 celebrar %2", args0: [{ type: "field_input", name: "ID", text: "magia" }, { type: "field_input", name: "MSG", text: "¡Lo lograste!" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_if", message0: "si puntos >= %1 mostrar %2", args0: [{ type: "field_input", name: "N", text: "10" }, { type: "field_input", name: "MSG", text: "¡Ganaste!" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_greet", message0: "saludar input %1 título %2 botón %3", args0: [{ type: "field_input", name: "INP", text: "nom" }, { type: "field_input", name: "T", text: "t" }, { type: "field_input", name: "BTN", text: "b" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_list", message0: "pintar lista en %1 items %2", args0: [{ type: "field_input", name: "DIV", text: "inv" }, { type: "field_input", name: "ITEMS", text: "🗡️,🛡️,🧪" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_validate", message0: "validar form %1 email %2 pass %3 error %4", args0: [{ type: "field_input", name: "F", text: "f" }, { type: "field_input", name: "E", text: "e" }, { type: "field_input", name: "P", text: "p" }, { type: "field_input", name: "ERR", text: "err" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_save", message0: "guardar récord botón %1 muestra %2", args0: [{ type: "field_input", name: "BTN", text: "j" }, { type: "field_input", name: "SPAN", text: "r" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_fetch", message0: "traer pokémon en %1 botón %2", args0: [{ type: "field_input", name: "OUT", text: "out" }, { type: "field_input", name: "BTN", text: "go" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_log", message0: "depurar ver %1", args0: [{ type: "field_input", name: "WHAT", text: "puntos" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_level", message0: "niveles 10/20 en %1 msg %2", args0: [{ type: "field_input", name: "N", text: "n" }, { type: "field_input", name: "MSG", text: "msg" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_win", message0: "victoria al llegar a %1", args0: [{ type: "field_input", name: "N", text: "20" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_timer", message0: "temporizador %1 seg mensaje %2", args0: [{ type: "field_input", name: "SEC", text: "30" }, { type: "field_input", name: "MSG", text: "¡Tiempo!" }], previousStatement: "Js", nextStatement: "Js", colour: 50 },
  { type: "bw_js_ifelse", message0: "si %1 hacer %2 si no %3", args0: [{ type: "field_input", name: "COND", text: "puntos>=5" }, { type: "input_statement", name: "DO", check: "Js" }, { type: "input_statement", name: "ELSE", check: "Js" }], previousStatement: "Js", nextStatement: "Js", colour: 50, tooltip: "Condicional con dos caminos" },
  { type: "bw_js_repeat", message0: "repetir %1 veces %2", args0: [{ type: "field_input", name: "N", text: "3" }, { type: "input_statement", name: "DO", check: "Js" }], previousStatement: "Js", nextStatement: "Js", colour: 50, tooltip: "Bucle for" },
  { type: "bw_js_func", message0: "definir función %1 hacer %2", args0: [{ type: "field_input", name: "NAME", text: "saludar" }, { type: "input_statement", name: "DO", check: "Js" }], previousStatement: "Js", nextStatement: "Js", colour: 50, tooltip: "Crea una función reutilizable" },
  { type: "bw_js_call", message0: "llamar función %1", args0: [{ type: "field_input", name: "NAME", text: "saludar" }], previousStatement: "Js", nextStatement: "Js", colour: 50, tooltip: "Ejecuta la función" },
  { type: "bw_js_onclick", message0: "al hacer clic en %1 %2", args0: [{ type: "field_input", name: "ID", text: "btn" }, { type: "input_statement", name: "DO", check: "Js" }], previousStatement: "Js", nextStatement: "Js", colour: 50, tooltip: "Haz cosas al hacer clic" },
  { type: "bw_js_settimeout", message0: "después de %1 ms %2", args0: [{ type: "field_input", name: "MS", text: "1000" }, { type: "input_statement", name: "DO", check: "Js" }], previousStatement: "Js", nextStatement: "Js", colour: 50, tooltip: "Espera y luego ejecuta" },
  { type: "bw_js_obj", message0: "personaje %1 datos %2", args0: [{ type: "field_input", name: "NAME", text: "heroe" }, { type: "field_input", name: "PROPS", text: "nombre:'Bloqui',poder:10" }], previousStatement: "Js", nextStatement: "Js", colour: 50, tooltip: "Objeto con datos del personaje" },
  { type: "bw_js_arr", message0: "lista %1 con items (coma) %2", args0: [{ type: "field_input", name: "NAME", text: "inventario" }, { type: "field_input", name: "ITEMS", text: "espada,escudo" }], previousStatement: "Js", nextStatement: "Js", colour: 50, tooltip: "Crea un array con varios valores" },
  { type: "bw_js_push", message0: "añadir %1 a la lista %2", args0: [{ type: "field_input", name: "VAL", text: "pocion" }, { type: "field_input", name: "ARR", text: "inventario" }], previousStatement: "Js", nextStatement: "Js", colour: 50, tooltip: "push: suma un elemento al final" },
  { type: "bw_js_filter", message0: "filtrar lista %1 quitando %2", args0: [{ type: "field_input", name: "ARR", text: "inventario" }, { type: "field_input", name: "VAL", text: "pocion" }], previousStatement: "Js", nextStatement: "Js", colour: 50, tooltip: "filter: deja fuera los que coinciden" },
  { type: "bw_js_class", message0: "clase %1 en id %2 acción %3", args0: [{ type: "field_input", name: "CLASE", text: "activo" }, { type: "field_input", name: "ID", text: "btn" }, { type: "field_dropdown", name: "ACTION", options: [["poner", "add"], ["quitar", "remove"], ["alternar", "toggle"]] }], previousStatement: "Js", nextStatement: "Js", colour: 50, tooltip: "classList: cambia clases CSS desde JS" },
  { type: "bw_js_qs", message0: "selector CSS %1 cambiar texto a %2", args0: [{ type: "field_input", name: "SEL", text: ".card h2" }, { type: "field_input", name: "TEXT", text: "¡Hola!" }], previousStatement: "Js", nextStatement: "Js", colour: 50, tooltip: "querySelector: busca por selector CSS" },
];

// Icono por bloque: lenguajes por defecto según colour; casos especiales aparte.
const SPECIAL_ICON: Record<string, keyof typeof BW_ICONS> = {
  bw_img_asset: "folder",
  bw_video_asset: "folder",
  bw_css_dark: "moon",
  bw_js_win: "trophy",
  bw_js_timer: "timer",
  bw_sem: "sem",
};

function iconFor(type: string, colour: number): keyof typeof BW_ICONS {
  if (SPECIAL_ICON[type]) return SPECIAL_ICON[type];
  if (colour === 16) return "html";
  if (colour === 210) return "css";
  return "js";
}

// Inserta el icono SVG como primer argumento (%1) y renumera los %n existentes.
function withIcon(def: Record<string, unknown>): Record<string, unknown> {
  const type = def.type as string;
  const colour = def.colour as number;
  const shifted = (def.message0 as string).replace(
    /%(\d+)/g,
    (_, n) => `%${Number(n) + 1}`,
  );
  const args0 = (def.args0 as unknown[]) ?? [];
  return {
    ...def,
    message0: `%1 ${shifted}`,
    args0: [fieldImage(iconFor(type, colour)), ...args0],
  };
}

export const BLOCK_DEFS: Array<Record<string, unknown>> = RAW_DEFS.map(withIcon);

export const BLOCK_COUNT = BLOCK_DEFS.length;

// Verificador declarativo por lección.
// Cada lección declara 2-4 objetivos comprobables sobre el código GENERADO
// (tags HTML, propiedades CSS, patrones JS) y sobre los bloques usados.
// El motor es data-only: sin funciones, fácil de testear y de ampliar.

export type CheckCtx = {
  types: string[];
  typeSet: Set<string>;
  html: string;
  css: string;
  js: string;
  count: number;
};

export type Regla = {
  id: string;
  label: string; // objetivo (positivo, se muestra al niño)
  hint: string; // pista si aún no se cumple
  anyType?: string[]; // al menos uno de estos bloques
  allType?: string[]; // todos estos bloques
  minType?: Array<[string, number]>; // conteo mínimo por bloque
  tags?: string[]; // todos estos tags presentes en el HTML
  anyTag?: string[]; // al menos uno de estos tags
  html?: string[]; // todos estos regex presentes en el HTML
  css?: string[]; // todos estos regex presentes en el CSS
  anyCss?: string[]; // al menos uno de estos regex
  js?: string[]; // todos estos regex presentes en el JS
  anyJs?: string[]; // al menos uno de estos regex
};

const tagRe = (t: string) => new RegExp(`<${t}\\b`, "i");

export function evaluarRegla(r: Regla, c: CheckCtx): boolean {
  if (r.anyType && !r.anyType.some((t) => c.typeSet.has(t))) return false;
  if (r.allType && !r.allType.every((t) => c.typeSet.has(t))) return false;
  if (r.minType && !r.minType.every(([t, n]) => c.types.filter((x) => x === t).length >= n)) return false;
  if (r.tags && !r.tags.every((t) => tagRe(t).test(c.html))) return false;
  if (r.anyTag && !r.anyTag.some((t) => tagRe(t).test(c.html))) return false;
  if (r.html && !r.html.every((p) => new RegExp(p, "i").test(c.html))) return false;
  if (r.css && !r.css.every((p) => new RegExp(p, "i").test(c.css))) return false;
  if (r.anyCss && !r.anyCss.some((p) => new RegExp(p, "i").test(c.css))) return false;
  if (r.js && !r.js.every((p) => new RegExp(p, "i").test(c.js))) return false;
  if (r.anyJs && !r.anyJs.some((p) => new RegExp(p, "i").test(c.js))) return false;
  return true;
}

// Regex reutilizados
const HAS_HTTPS = 'href="https?://';
const HAS_SRC = 'src="https?://';
const EVENT = "onclick|addEventListener";

export const REGLAS: Record<string, Regla[]> = {
  // ================= HTML =================
  "html-1": [
    { id: "h1", label: "Un título <h1>", hint: "Arrastra el bloque 'título' y elige h1.", tags: ["h1"] },
  ],
  "html-2": [
    { id: "p", label: "Un párrafo sobre ti", hint: "Usa el bloque párrafo.", tags: ["p"] },
    { id: "a", label: "Un enlace con URL real", hint: "Usa el bloque enlace con una URL https://.", tags: ["a"], html: [HAS_HTTPS] },
    { id: "img", label: "Tu avatar con <img> y alt", hint: "Usa el bloque imagen y rellena el texto alternativo (alt).", tags: ["img"], html: ['alt="'] },
  ],
  "html-3": [
    { id: "ul", label: "Una lista con <ul> y <li>", hint: "Usa el bloque lista.", tags: ["ul", "li"] },
    { id: "table", label: "Una tabla de puntajes", hint: "Usa el bloque tabla.", tags: ["table"] },
    { id: "form", label: "Un formulario con botón", hint: "Usa el bloque formulario (trae botón).", tags: ["form", "button"] },
  ],
  "html-4": [
    { id: "sem", label: "Usa el bloque 'sección' (semántica)", hint: "Arrastra el bloque sección y elige la parte.", anyType: ["bw_sem"] },
    { id: "headerfooter", label: "Cabecera y pie", hint: "Usa secciones header y footer.", tags: ["header", "footer"] },
    { id: "main", label: "Contenido principal <main>", hint: "Añade una sección main con tu post.", tags: ["main"] },
  ],
  "html-5": [
    { id: "video", label: "Un video con controles", hint: "Usa el bloque video (ya trae controls).", tags: ["video"], html: ["controls"] },
    { id: "audio", label: "Un audio", hint: "Usa el bloque audio.", tags: ["audio"] },
    { id: "iframe", label: "Un iframe de YouTube", hint: "Usa el bloque iframe con URL https://.", tags: ["iframe"], html: [HAS_SRC] },
  ],
  "html-6": [
    { id: "form", label: "Formulario con campos obligatorios", hint: "Usa el bloque formulario (incluye required).", tags: ["form"], html: ["required"] },
    { id: "email", label: "Un campo de email", hint: "Usa el bloque campo con tipo email.", html: ['type="email"'] },
    { id: "label", label: "Cada campo con su <label>", hint: "Usa bloques campo (traen label).", tags: ["label"] },
  ],
  "html-7": [
    { id: "caption", label: "Tabla con <caption>", hint: "Usa el bloque tabla (trae caption).", tags: ["table", "caption"] },
    { id: "th", label: "Encabezados con <th>", hint: "La tabla ya trae una fila de encabezados <th>.", tags: ["th"] },
    { id: "sections", label: "thead y tbody", hint: "Usa el bloque tabla completo.", tags: ["thead", "tbody"] },
  ],
  "html-8": [
    { id: "head", label: "Título y descripción de la página", hint: "Usa el bloque 'página' para poner título y meta descripción.", anyType: ["bw_head"], tags: ["title", "meta"], html: ['name="description"'] },
  ],
  "html-9": [
    { id: "details", label: "Un desplegable <details>", hint: "Usa el bloque desplegable.", tags: ["details", "summary"] },
    { id: "progress", label: "Una barra de progreso", hint: "Usa el bloque barra de progreso.", tags: ["progress"] },
  ],
  "html-10": [
    { id: "sem", label: "header, nav, main y footer", hint: "Usa secciones: cabecera, navegación, contenido y pie.", tags: ["header", "nav", "main", "footer"] },
    { id: "img", label: "Imagen con alt", hint: "Usa el bloque imagen (o imagen mía) con alt.", tags: ["img"], html: ['alt="'] },
    { id: "list", label: "Una lista <ul>", hint: "Usa el bloque lista.", tags: ["ul"] },
    { id: "table", label: "Tabla con encabezados <th>", hint: "Usa el bloque tabla.", tags: ["table", "th"] },
    { id: "form", label: "Formulario con required", hint: "Usa el bloque formulario.", tags: ["form"], html: ["required"] },
  ],

  // ================= CSS =================
  "css-1": [
    { id: "sel", label: "Un bloque de estilo aplicado", hint: "Usa bloques color/fuente/caja.", anyType: ["bw_css_color", "bw_css_font", "bw_css_box"] },
    { id: "colors", label: "Color de texto y de fondo", hint: "Usa el bloque color (texto + fondo).", css: ["color:", "background"] },
  ],
  "css-2": [
    { id: "box", label: "Cajas con padding y borde", hint: "Usa el bloque caja.", css: ["padding", "border"] },
    { id: "flex", label: "Alinea con Flexbox", hint: "Usa un bloque de flex.", css: ["display:flex"] },
  ],
  "css-3": [
    { id: "hover", label: "Efecto al pasar el mouse (:hover)", hint: "Usa el bloque hover.", css: [":hover"] },
    { id: "id", label: "Estilo por id (#)", hint: "Escribe #lider en el selector de un bloque.", css: ["#"] },
  ],
  "css-4": [
    { id: "grad", label: "Fondo con degradado", hint: "Usa el bloque degradado.", css: ["gradient"] },
    { id: "shadow", label: "Sombra dura estilo BLOCKWEB", hint: "Usa el bloque sombra dura.", css: ["box-shadow"] },
  ],
  "css-5": [
    { id: "rel", label: "Padre con position:relative", hint: "Usa el bloque insignia (pone relative al padre).", css: ["position:relative"] },
    { id: "abs", label: "Insignia con position:absolute", hint: "Usa el bloque insignia flotante.", css: ["position:absolute"] },
    { id: "sticky", label: "Menú que se pega (sticky)", hint: "Usa el bloque menú fijo al hacer scroll.", css: ["position:sticky"] },
  ],
  "css-6": [
    { id: "grid", label: "display:grid", hint: "Usa un bloque de grid.", css: ["display:grid"] },
    { id: "cols", label: "3 columnas iguales", hint: "Usa repeat(3,1fr) en las columnas.", css: ["repeat\\(3,\\s*1fr\\)"] },
    { id: "gap", label: "Separación con gap", hint: "Añade gap en el bloque grid.", css: ["gap"] },
  ],
  "css-7": [
    { id: "media", label: "Una regla @media", hint: "Usa el bloque media o responsive.", css: ["@media"] },
    { id: "fr", label: "Columnas flexibles (1fr o %)", hint: "Usa 1fr en vez de px fijos.", css: ["1fr"] },
  ],
  "css-8": [
    { id: "key", label: "@keyframes", hint: "Usa el bloque animar salto.", css: ["@keyframes"] },
    { id: "anim", label: "Aplica la animation", hint: "Usa el bloque animar (aplica animation).", css: ["animation:"] },
    { id: "trans", label: "Transición suave", hint: "Usa el bloque transición o hover.", css: ["transition"] },
  ],
  "css-9": [
    { id: "root", label: "Variables en :root", hint: "Usa el bloque modo oscuro (crea :root).", css: [":root"] },
    { id: "var", label: "Usa las variables con var()", hint: "Usa var(--nombre) en las reglas.", css: ["var\\(--"] },
    { id: "dark", label: "Un tema .dark alternativo", hint: "Usa el bloque modo oscuro.", css: [".dark"] },
  ],
  "css-10": [
    { id: "grad", label: "Hero con degradado", hint: "Usa el bloque degradado en el hero.", css: ["gradient"] },
    { id: "layout", label: "Cards con Grid o Flex", hint: "Usa un bloque grid o flex para las cards.", anyCss: ["display:grid", "display:flex"] },
    { id: "media", label: "Responsive con @media", hint: "Usa el bloque media para pasar a 3 columnas.", css: ["@media"] },
    { id: "anim", label: "Animación, transición o hover", hint: "Añade animación o hover a un elemento.", anyCss: ["@keyframes", "animation:", "transition", ":hover"] },
  ],

  // ================= JS =================
  "js-1": [
    { id: "counter", label: "Un contador que suma al click", hint: "Usa el bloque contador.", anyType: ["bw_js_counter", "bw_js_onclick"], js: [EVENT] },
    { id: "dom", label: "Muestra el valor en pantalla", hint: "El contador usa textContent para pintar.", js: ["textContent"] },
  ],
  "js-2": [
    { id: "if", label: "Una condición if", hint: "Usa el bloque si… si no.", js: ["if\\("] },
    { id: "event", label: "Reacciona a un click", hint: "Usa el bloque al hacer clic.", js: [EVENT] },
    { id: "cmp", label: "Compara (>=, <=, ===)", hint: "Escribe la condición con >= o ===.", js: [">=|<=|===|=="] },
  ],
  "js-3": [
    { id: "func", label: "Define una función", hint: "Usa el bloque definir función.", anyType: ["bw_js_func"], js: ["function"] },
    { id: "exec", label: "Conecta la función (click o llamada)", hint: "Usa 'al hacer clic' o 'llamar función'.", anyJs: ["onclick=", "addEventListener", "\\w+\\(\\);"] },
  ],
  "js-4": [
    { id: "array", label: "Un array de items", hint: "Usa el bloque pintar lista (crea el array).", anyType: ["bw_js_list"], js: ["\\["] },
    { id: "loop", label: "Recorre y pinta todos", hint: "Pinta con map/forEach e innerHTML.", anyJs: ["map\\(", "forEach", "innerHTML"] },
  ],
  "js-5": [
    { id: "prev", label: "Evita que el form se recargue", hint: "Usa el bloque validar form (preventDefault).", js: ["preventDefault"] },
    { id: "valid", label: "Valida antes de aceptar", hint: "Comprueba el valor con un if.", js: ["if\\("] },
    { id: "msg", label: "Muestra el mensaje en pantalla", hint: "Escribe el resultado con textContent.", js: ["textContent"] },
  ],
  "js-6": [
    { id: "get", label: "Lee el récord al cargar", hint: "Usa el bloque guardar récord (getItem).", js: ["getItem"] },
    { id: "set", label: "Guarda el récord", hint: "El bloque guardar récord usa setItem.", js: ["setItem"] },
  ],
  "js-7": [
    { id: "fetch", label: "Trae datos con fetch", hint: "Usa el bloque traer pokémon.", js: ["fetch\\("] },
    { id: "json", label: "Convierte la respuesta a objeto", hint: "Usa await r.json().", js: ["\\.json\\(\\)"] },
    { id: "try", label: "Maneja errores (try/catch)", hint: "El bloque fetch usa try/catch.", js: ["try|catch"] },
  ],
  "js-8": [
    { id: "obj", label: "Crea un personaje (objeto)", hint: "Usa el bloque personaje.", anyType: ["bw_js_obj"], js: ["\\{"] },
    { id: "paint", label: "Muéstralo o modifícalo", hint: "Pinta el personaje y sube su poder al click.", anyJs: ["onclick", "textContent", "innerHTML", "forEach"] },
  ],
  "js-9": [
    { id: "log", label: "Depura con console.log", hint: "Usa el bloque depurar.", js: ["console\\.log"] },
    { id: "eq", label: "Compara con === (no =)", hint: "En la condición usa === para comparar.", js: ["==="] },
  ],
  "js-10": [
    { id: "counter", label: "Puntos que suben al click", hint: "Usa el bloque contador.", js: [EVENT] },
    { id: "levels", label: "Niveles con if", hint: "Añade un bloque si… si no para los niveles.", js: ["if\\("] },
    { id: "save", label: "Récord que no se pierde", hint: "Usa el bloque guardar récord (localStorage).", js: ["localStorage"] },
    { id: "win", label: "Mensaje de victoria", hint: "Muestra un mensaje al ganar.", js: ["textContent|innerHTML"] },
  ],
};

export function reglasDe(leccionId: string): Regla[] {
  return REGLAS[leccionId] ?? [];
}

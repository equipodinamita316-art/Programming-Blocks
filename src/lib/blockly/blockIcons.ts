// Iconos SVG (data-URI) para los bloques Blockly.
// Blockly pinta el asunto del bloque con el color del lenguaje; el icono es
// tinta oscura fija (#1a1523) para leerse bien sobre cualquier color de bloque.

const INK = "#1a1523";

function svg(paths: string): string {
  const body = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(body)}`;
}

export const BW_ICONS: Record<string, string> = {
  html: svg(
    '<rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M9 6v6M15 6v6M6 12v6M12 12v6M18 12v6M3 12h18"/>',
  ),
  css: svg('<path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z"/>'),
  js: svg('<path d="M13 2 5 13h6l-1 9 8-11h-6z"/>'),
  folder: svg(
    '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  ),
  moon: svg('<path d="M20 14a8 8 0 1 1-10-10 7 7 0 0 0 10 10z"/>'),
  trophy: svg(
    '<path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 6H5a2 2 0 0 0 3 3M16 6h3a2 2 0 0 1-3 3M10 14h4M12 14v3M9 20h6"/>',
  ),
  timer: svg('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>'),
  sem: svg(
    '<path d="M3 21h18M5 21V10M19 21V10M4 10h16L12 4 4 10zM9 21v-6M15 21v-6"/>',
  ),
};

export function fieldImage(icon: keyof typeof BW_ICONS | string) {
  return {
    type: "field_image",
    src: BW_ICONS[icon] ?? BW_ICONS.html,
    width: 16,
    height: 16,
    alt: icon,
  };
}

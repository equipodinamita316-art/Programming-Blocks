import { PLANTILLAS } from "@/data/cursos";
import { LocalView } from "./LocalView";
import { Icon } from "@/components/Icon";

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let html = "";
  let title = slug;

  // Plantilla base
  const base = PLANTILLAS.find((p) => slug.startsWith(p.slug));
  if (base) {
    html = base.html;
    title = base.nombre;
  }

  // Proyecto local no accesible en server, mostramos mensaje + intento client
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5 text-sm">
        <Icon name="globe" size={15} />
        Página pública <b>/p/{slug}</b> · {title}
      </div>
      {html ? (
        <div className="rounded-3xl overflow-hidden border-4 border-[#1a1523] bg-white">
          <iframe
            title={slug}
            sandbox="allow-scripts"
            srcDoc={html}
            className="w-full h-[70vh] bg-white"
          />
        </div>
      ) : (
        <LocalView slug={slug} />
      )}
    </div>
  );
}

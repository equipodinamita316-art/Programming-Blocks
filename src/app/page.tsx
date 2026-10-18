import Link from "next/link";
import { Bloqui } from "@/components/Bloqui";
import { Icon, type IconName } from "@/components/Icon";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero Persuade */}
      <section className="grid md:grid-cols-2 gap-6 items-center rounded-3xl border-4 border-[#1a1523] bg-white p-6 md:p-10 block-shadow">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFC700] border-2 border-[#1a1523] px-3 py-1 text-xs font-extrabold">
            <Icon name="blocks" size={14} />
            SCRATCH +
            <Icon name="globe" size={14} />
            WORDPRESS · PARA WEB
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.02] mt-3">
            Aprende HTML, CSS y JS{" "}
            <span className="bg-[#FF6B35] text-white px-2 rounded-xl">
              creando
            </span>{" "}
            lo que amas.
          </h1>
          <p className="mt-3 text-base md:text-lg opacity-80">
            Divertido pero difícil: misiones, lab libre y retos boss. Con
            certificado verificable con QR. En móvil, tablet y escritorio.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#1a1523] text-white font-extrabold px-6 py-3 text-center block-shadow"
            >
              <Icon name="rocket" size={18} />
              Empezar gratis
            </Link>
            <Link
              href="/playground"
              className="flex items-center justify-center gap-2 rounded-2xl border-4 border-[#1a1523] font-extrabold px-6 py-3 text-center"
            >
              <Icon name="blocks" size={18} />
              Probar bloques
            </Link>
          </div>
          <div className="mt-3 text-sm opacity-70">
            Sin dominio por ahora · funciona en localhost:3000 · luego
            blockweb.com
          </div>
        </div>
        <div className="rounded-2xl border-4 border-[#1a1523] overflow-hidden bg-[#FFF8EC]">
          <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-[#1a1523]/20 text-sm font-bold">
            <Bloqui size={32} /> mini-demo: bloques → web real
          </div>
          <div className="p-4 grid gap-2 text-sm font-bold">
            <div className="flex items-center gap-2 rounded-xl bg-[#FF6B35] text-white px-3 py-2 block-shadow-sm">
              <Icon name="html" size={16} />
              crear_título [ Mi página gamer ]
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#2563EB] text-white px-3 py-2 block-shadow-sm">
              <Icon name="css" size={16} />
              estilo [ fondo negro + texto naranja ]
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#FFC700] px-3 py-2 border-2 border-[#1a1523]">
              <Icon name="js" size={16} />
              al_click [ celebrar
              <Icon name="sparkles" size={14} />]
            </div>
            <div className="rounded-xl bg-white border-4 border-[#1a1523] p-3 text-center">
              <div className="font-display text-2xl font-extrabold">
                Mi página gamer
              </div>
              <div className="flex items-center justify-center gap-1 text-xs opacity-70">
                <Icon name="arrowLeft" size={12} />
                vista previa viva estilo WordPress
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rutas */}
      <section className="grid md:grid-cols-3 gap-4">
        {(
          [
            {
              t: "HTML",
              icon: "html",
              c: "#FF6B35",
              d: "Títulos, textos, imágenes, formularios. Construye tu tarjeta.",
              href: "/aprender/html/html-1",
            },
            {
              t: "CSS",
              icon: "css",
              c: "#2563EB",
              d: "Colores, cajas, Flexbox y responsive. Diseña tu inventario.",
              href: "/aprender/css/css-1",
            },
            {
              t: "JS",
              icon: "js",
              c: "#FFC700",
              d: "Variables, clicks y condicionales. Haz tu contador vivo.",
              href: "/aprender/js/js-1",
            },
          ] as { t: string; icon: IconName; c: string; d: string; href: string }[]
        ).map((r) => (
          <Link
            key={r.t}
            href={r.href}
            className="rounded-3xl border-4 border-[#1a1523] p-5 bg-white block-shadow"
          >
            <div
              className="flex items-center gap-2 font-display text-2xl font-extrabold"
              style={{ color: r.c }}
            >
              <Icon name={r.icon} size={24} />
              {r.t}
            </div>
            <p className="mt-1 text-sm opacity-80">{r.d}</p>
            <div className="mt-3 flex items-center gap-1.5 font-bold underline">
              Entrar
              <Icon name="arrowRight" size={16} />
            </div>
          </Link>
        ))}
      </section>

      {/* Cómo funciona */}
      <section className="grid md:grid-cols-4 gap-3 text-sm">
        {(
          [
            { t: "Misión", icon: "book", d: "Historia corta + 1 concepto. 5 min." },
            { t: "Lab Libre", icon: "palette", d: "Crea lo que quieras con estrellas extra." },
            { t: "Boss", icon: "boss", d: "Debugging y réplica ciega. Aquí sube la exigencia." },
            { t: "Certificado", icon: "graduation", d: "Examen final + PDF con QR verificable." },
          ] as { t: string; icon: IconName; d: string }[]
        ).map(({ t, icon, d }) => (
          <div
            key={t}
            className="rounded-2xl border-2 border-[#1a1523] p-4 bg-white"
          >
            <div className="flex items-center gap-2 font-extrabold">
              <Icon name={icon} size={18} />
              {t}
            </div>
            <div className="opacity-70">{d}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

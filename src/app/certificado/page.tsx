"use client";

import { getCerts } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";

export default function CertificadoIndex() {
  const [certs] = useState<{ codigo: string; nombre: string; nota: number }[]>(() => getCerts());
  return (
    <div className="max-w-[640px] mx-auto flex flex-col gap-4">
      <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold">
        <Icon name="graduation" size={28} />
        Mis certificados
      </h1>
      <p className="text-sm opacity-70">Al aprobar el examen final con 70%+ generas PDF + QR verificable en /verify/[codigo].</p>
      <Link href="/examen/final" className="flex items-center justify-center gap-2 rounded-2xl bg-[#FF6B35] text-white font-extrabold py-3 text-center block-shadow-sm">
        Ir al examen final
        <Icon name="arrowRight" size={18} />
      </Link>
      {certs.length === 0 ? (
        <p className="flex items-center gap-1.5 text-sm opacity-70">
          Sin certificados aún. ¡Tú puedes!
          <Icon name="dumbbell" size={15} />
        </p>
      ) : (
        <div className="grid gap-2">
          {certs.map((c) => <Link key={c.codigo} href={`/verify/${c.codigo}`} className="flex items-center gap-1.5 rounded-2xl border-2 p-3 font-bold"><Icon name="check" size={16} /> {c.nombre} · {c.nota}% · <span className="font-mono">{c.codigo}</span></Link>)}
        </div>
      )}
    </div>
  );
}

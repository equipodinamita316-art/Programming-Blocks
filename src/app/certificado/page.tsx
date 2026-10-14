"use client";

import { getCerts } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

export default function CertificadoIndex() {
  const [certs] = useState<{ codigo: string; nombre: string; nota: number }[]>(() => getCerts());
  return (
    <div className="max-w-[640px] mx-auto flex flex-col gap-4">
      <h1 className="font-display text-3xl font-extrabold">🎓 Mis certificados</h1>
      <p className="text-sm opacity-70">Al aprobar el examen final con 70%+ generas PDF + QR verificable en /verify/[codigo].</p>
      <Link href="/examen/final" className="rounded-2xl bg-[#FF6B35] text-white font-extrabold py-3 text-center block-shadow-sm">Ir al examen final →</Link>
      {certs.length === 0 ? <p className="text-sm opacity-70">Sin certificados aún. ¡Tú puedes! 💪</p> : (
        <div className="grid gap-2">
          {certs.map((c) => <Link key={c.codigo} href={`/verify/${c.codigo}`} className="rounded-2xl border-2 p-3 font-bold">✅ {c.nombre} · {c.nota}% · <span className="font-mono">{c.codigo}</span> →</Link>)}
        </div>
      )}
    </div>
  );
}

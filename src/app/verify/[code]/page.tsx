"use client";

import { findCert } from "@/lib/store";
import { verifyCertRemote } from "@/lib/projects";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [remote, setRemote] = useState<{ nombre: string; nota: number; fecha: string; codigo: string } | null>(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    let live = true;
    (async () => {
      const r = await verifyCertRemote(code);
      if (live) { setRemote(r); setChecked(true); }
    })();
    return () => { live = false; };
  }, [code]);
  const cert = remote || (typeof window !== "undefined" ? findCert(code) : null);
  const fecha = cert ? ("fecha" in cert ? (cert as { fecha: string }).fecha : "") : "";

  return (
    <div className="max-w-[560px] mx-auto rounded-3xl border-4 border-[#1a1523] dark:border-white/20 bg-white dark:bg-white/5 p-6 text-center block-shadow">
      <div className="text-4xl">{cert ? "✅" : checked ? "❌" : "⏳"}</div>
      <h1 className="font-display text-2xl font-extrabold mt-2">Verificación {code}</h1>
      {cert ? (
        <>
          <p className="mt-2">Certificado <b>válido</b> {remote ? "en la nube ✅" : "(demo local)"}.</p>
          <div className="mt-3 rounded-2xl bg-black/5 dark:bg-white/10 p-3 text-sm">
            <div><b>Nombre:</b> {cert.nombre}</div>
            <div><b>Nota:</b> {cert.nota}%</div>
            {!!fecha && <div><b>Fecha:</b> {new Date(fecha).toLocaleDateString()}</div>}
            <div><b>Código:</b> <span className="font-mono">{cert.codigo}</span></div>
          </div>
        </>
      ) : checked ? (
        <>
          <p className="mt-2 opacity-80">No encontramos ese código ni en la nube ni en este dispositivo.</p>
          <p className="text-sm opacity-70">Prueba con un código generado en <Link className="underline" href="/examen/final">el examen</Link> en este mismo navegador.</p>
        </>
      ) : (
        <p className="mt-2 opacity-70">Verificando en la nube...</p>
      )}
      <Link href="/" className="inline-block mt-4 underline font-bold">← Volver a BLOCKWEB</Link>
    </div>
  );
}

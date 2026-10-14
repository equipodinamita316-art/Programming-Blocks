"use client";

import { useEffect, useMemo, useState } from "react";
import { EXAMEN_FINAL } from "@/data/cursos";
import { awardExam, getEligibility, saveCert, saveCertCloud } from "@/lib/store";
import { shuffleQuiz } from "@/lib/quiz";
import Link from "next/link";
import QRCode from "qrcode";

export default function ExamenFinal() {
  const [nombre, setNombre] = useState("");
  const [ans, setAns] = useState<Record<number, number>>({});
  const [res, setRes] = useState<null | { nota: number; codigo: string; qr: string }>(null);
  const [mounted, setMounted] = useState(false);
  const [seed, setSeed] = useState(12345);
  const [fails, setFails] = useState(0);
  const [elig, setElig] = useState({ done: 0, total: 30, pct: 0, bossProjects: 0, eligible: false });
  useEffect(() => {
    // Client-only: seed aleatorio y localStorage deben generarse tras montar para no romper la hidratación SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setSeed(Math.floor(Math.random() * 1e9));
    setElig(getEligibility());
    const h = () => setElig(getEligibility());
    window.addEventListener("bw-xp", h);
    return () => window.removeEventListener("bw-xp", h);
  }, []);
  const quiz = useMemo(() => shuffleQuiz(EXAMEN_FINAL, seed), [seed]);

  const corregir = async () => {
    if (!nombre.trim()) { alert("Escribe tu nombre para el certificado"); return; }
    const e = getEligibility();
    setElig(e);
    if (!e.eligible) {
      alert(`🔒 Te falta para el certificado: ${e.done}/${e.total} lecciones (${e.pct}% de 80%) y ${e.bossProjects}/1 Boss publicado.`);
      return;
    }
    let buenas = 0;
    quiz.forEach((q, i) => { if (ans[i] === q.correcta) buenas++; });
    const nota = Math.round((buenas / quiz.length) * 100);
    if (nota < 70) {
      setFails((f) => f + 1);
      alert(`Sacaste ${nota}%. Necesitas 70%+. Intento ${fails + 1} — repasa y reintenta 💪`);
      return;
    }
    const codigo = `BW-2026-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    awardExam(nombre);
    void saveCertCloud(codigo, nota);
    const url = `${location.origin}/verify/${codigo}`;
    const qr = await QRCode.toDataURL(url);
    saveCert({ codigo, nombre, nota, fecha: new Date().toISOString() });
    setRes({ nota, codigo, qr });
  };

  if (res) {
    return (
      <div className="max-w-[640px] mx-auto rounded-3xl border-4 border-[#1a1523] dark:border-white/20 bg-white dark:bg-white/5 p-6 text-center block-shadow">
        <div className="text-5xl">🎓</div>
        <h1 className="font-display text-3xl font-extrabold mt-2">¡Felicidades, {nombre}!</h1>
        <p className="mt-1">Aprobaste con {res.nota}% · +200 XP</p>
        <div className="mt-4 rounded-2xl border-4 border-[#FFC700] p-4 bg-[#FFC700]/10">
          <div className="font-display font-extrabold">CERTIFICADO BLOCKWEB</div>
          <div className="text-sm">HTML · CSS · JS · Nivel Constructor</div>
          <div className="mt-2 font-mono font-bold">Código: {res.codigo}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={res.qr} alt="QR verificación" className="mx-auto mt-2 w-40 h-40 border-4 border-white bg-white" />
          <div className="text-xs mt-1 opacity-70">Escanea o entra a /verify/{res.codigo}</div>
        </div>
        <div className="mt-4 flex gap-2 justify-center">
          <Link href={`/verify/${res.codigo}`} className="rounded-xl bg-[#1a1523] text-white dark:bg-white dark:text-black font-bold px-4 py-2">Verificar ✅</Link>
          <button onClick={() => window.print()} className="rounded-xl border-2 px-4 py-2 font-bold">🖨️ Imprimir / PDF</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto flex flex-col gap-4">
      <h1 className="font-display text-3xl font-extrabold">👹 Examen final BLOCKWEB</h1>
      <p className="text-sm opacity-70">15 preguntas mezcladas y aleatorias HTML/CSS/JS · 70% + 80% cursos + 1 Boss publicado para certificado.</p>
      {!mounted ? (
        <p className="text-sm opacity-70">⏳ Cargando examen...</p>
      ) : !elig.eligible ? (
        <div className="rounded-2xl border-4 border-[#FF6B35] p-4 bg-white dark:bg-white/5">
          <p className="font-extrabold">🔒 Aún no puedes certificarte</p>
          <ul className="text-sm mt-1 list-disc ml-5">
            <li>Lecciones: {elig.done}/{elig.total} ({elig.pct}% de 80%)</li>
            <li>Boss publicado: {elig.bossProjects}/1</li>
          </ul>
          <Link href="/dashboard" className="inline-block mt-2 underline font-bold text-sm">Volver al mapa →</Link>
        </div>
      ) : null}
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre para el certificado" className="rounded-2xl border-4 border-[#1a1523] dark:border-white/20 px-4 py-3 font-bold bg-white dark:bg-white/5" />
      {mounted ? (
      <div key={seed} className="flex flex-col gap-4">
      {quiz.map((q, i) => (
        <div key={i} className="rounded-2xl border-2 border-[#1a1523] dark:border-white/20 p-3 bg-white dark:bg-white/5">
          <p className="font-bold">{i + 1}. {q.q}</p>
          <div className="grid sm:grid-cols-2 gap-2 mt-2">
            {q.opciones.map((op, j) => (
              <button key={j} onClick={() => setAns({ ...ans, [i]: j })} className={`rounded-xl border-2 px-3 py-2 text-sm font-bold text-left ${ans[i] === j ? "bg-[#FFC700]/50 border-[#1a1523]" : "border-black/10 dark:border-white/20"}`}>{op}</button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={corregir} className="rounded-2xl bg-[#FF6B35] text-white font-extrabold py-3 block-shadow-sm">🎓 Corregir y emitir certificado</button>
      </div>
      ) : null}
    </div>
  );
}

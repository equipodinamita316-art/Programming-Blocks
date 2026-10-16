"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { EXAMEN_BANCO } from "@/data/cursos";
import {
  awardExam,
  getCourseProgress,
  getEligibility,
  saveCert,
  saveCertCloud,
} from "@/lib/store";
import { publishProject } from "@/lib/projects";
import { MiniEditor } from "@/components/MiniEditor";
import { useNotice } from "@/lib/notice";
import type { Generated } from "@/components/BlocklyReal";
import {
  RETOS,
  addAttempt,
  checkProyecto,
  checkReto,
  getAttempts,
  getFase,
  medal,
  notaFinal,
  pickQuiz,
  quizScore,
  saveFase,
} from "@/lib/exam";

const F1_MIN = 20;
const F2_MIN = 15;

function useCountdown(active: boolean, minutes: number, onDone: () => void) {
  const [left, setLeft] = useState(minutes * 60);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setTimeout(onDone, 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return { left, label: `${mm}:${ss}`, urgent: left < 180 };
}

export default function ExamenFinal() {
  const [nombre, setNombre] = useState("");
  const [fase, setFase] = useState<1 | 2 | 3>(1);
  const [mounted, setMounted] = useState(false);
  const [seed, setSeed] = useState(12345);
  const [elig, setElig] = useState({
    done: 0,
    total: 30,
    pct: 0,
    bossProjects: 0,
    eligible: false,
  });
  const [courses, setCourses] = useState(getCourseProgress());
  const [f1, setF1] = useState(getFase(1));
  const [f2, setF2] = useState(getFase(2));
  const [f3, setF3] = useState(getFase(3));
  const [res, setRes] = useState<null | {
    nota: number;
    codigo: string;
    qr: string;
    slug: string;
    medalla: string;
  }>(null);

  useEffect(() => {
    // Client-only: seed, localStorage y elegibilidad tras montar (evita mismatch SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setSeed(Math.floor(Math.random() * 1e9));
    setElig(getEligibility());
    setCourses(getCourseProgress());
    setF1(getFase(1));
    setF2(getFase(2));
    setF3(getFase(3));
    try {
      setNombre(localStorage.getItem("bw-exam-nombre") || "");
    } catch {}
    const h = () => {
      setElig(getEligibility());
      setCourses(getCourseProgress());
    };
    window.addEventListener("bw-xp", h);
    return () => window.removeEventListener("bw-xp", h);
  }, []);

  const quiz = useMemo(() => pickQuiz(EXAMEN_BANCO, seed), [seed]);
  const reto = useMemo(() => RETOS[getAttempts() % RETOS.length], [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted)
    return <p className="font-bold">⏳ Cargando batalla final...</p>;

  if (!elig.eligible) {
    return (
      <div className="max-w-[720px] mx-auto flex flex-col gap-4">
        <h1 className="font-display text-3xl font-extrabold">
          👹 Examen final BLOCKWEB
        </h1>
        <div className="rounded-2xl border-4 border-[#FF6B35] p-4 bg-white">
          <p className="font-extrabold">🔒 Solo para quienes terminaron TODO</p>
          <ul className="text-sm mt-2 list-disc ml-5">
            {courses.map((c) => (
              <li key={c.slug}>
                {c.slug.toUpperCase()}: {c.done}/{c.total}{" "}
                {c.complete ? "✅" : "🔒"}
              </li>
            ))}
            <li>Boss publicados: {elig.bossProjects}/3 (uno por curso)</li>
          </ul>
          <Link
            href="/dashboard"
            className="inline-block mt-2 underline font-bold text-sm"
          >
            Volver al mapa →
          </Link>
        </div>
      </div>
    );
  }

  if (res) {
    return (
      <div className="max-w-[640px] mx-auto rounded-3xl border-4 border-[#1a1523] bg-white p-6 text-center block-shadow">
        <div className="text-5xl">{res.medalla}🎓</div>
        <h1 className="font-display text-3xl font-extrabold mt-2">
          ¡Graduado Blockweb, {nombre}!
        </h1>
        <p className="mt-1">
          Nota final {res.nota}% · +500 XP · Medalla {res.medalla}
        </p>
        <div className="mt-4 rounded-2xl border-4 border-[#FFC700] p-4 bg-[#FFC700]/10">
          <div className="font-display font-extrabold">
            CERTIFICADO BLOCKWEB — GRADUADO
          </div>
          <div className="text-sm">
            HTML · CSS · JS · Proyecto final incluido
          </div>
          <div className="mt-2 font-mono font-bold">Código: {res.codigo}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={res.qr}
            alt="QR verificación"
            className="mx-auto mt-2 w-40 h-40 border-4 border-white bg-white"
          />
          <div className="text-xs mt-1 opacity-70">
            Escanea o entra a /verify/{res.codigo}
          </div>
          <Link
            href={`/p/${res.slug}`}
            className="inline-block mt-2 underline font-bold text-sm"
          >
            🌐 Ver mi proyecto final →
          </Link>
        </div>
        <div className="mt-4 flex gap-2 justify-center">
          <Link
            href={`/verify/${res.codigo}`}
            className="rounded-xl bg-[#1a1523] text-white font-bold px-4 py-2"
          >
            Verificar ✅
          </Link>
          <button
            onClick={() => window.print()}
            className="rounded-xl border-2 px-4 py-2 font-bold"
          >
            🖨️ Imprimir / PDF
          </button>
        </div>
      </div>
    );
  }

  const graduar = async (s1: number, s2: number, s3: number, slug: string) => {
    const nota = notaFinal(s1, s2, s3);
    const codigo = `BW-2026-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    awardExam(nombre);
    void saveCertCloud(codigo, nota);
    const url = `${location.origin}/verify/${codigo}`;
    const qr = await QRCode.toDataURL(url);
    saveCert({ codigo, nombre, nota, fecha: new Date().toISOString() });
    setRes({ nota, codigo, qr, slug, medalla: medal(getAttempts()).label });
  };

  return (
    <div className="max-w-[860px] mx-auto flex flex-col gap-4">
      <h1 className="font-display text-3xl font-extrabold">
        👹 Batalla final: 3 rondas
      </h1>
      <p className="text-sm opacity-70">
        Ronda 1 Quiz 90% + 20 min · Ronda 2 Bloques 90% + 15 min · Ronda 3
        Proyecto 90% · Nota = 40/30/30 · Medalla por intentos.
      </p>
      <input
        value={nombre}
        onChange={(e) => {
          setNombre(e.target.value);
          try {
            localStorage.setItem("bw-exam-nombre", e.target.value);
          } catch {}
        }}
        placeholder="Tu nombre para el certificado"
        className="rounded-2xl border-4 border-[#1a1523] px-4 py-3 font-bold bg-white"
      />
      <div className="grid grid-cols-3 gap-2">
        {([1, 2, 3] as const).map((f) => {
          const passed = f === 1 ? !!f1 : f === 2 ? !!f2 : !!f3;
          const locked = (f === 2 && !f1) || (f === 3 && !f2);
          const label =
            f === 1 ? "📝 Quiz" : f === 2 ? "🧱 Bloques" : "🌐 Proyecto";
          return (
            <button
              key={f}
              disabled={locked}
              onClick={() => setFase(f)}
              className={`rounded-2xl border-4 px-2 py-2 font-extrabold text-sm ${fase === f ? "bg-[#1a1523] text-white" : locked ? "opacity-40" : ""}`}
            >
              {passed
                ? `✅ ${label} (${f === 1 ? f1!.score : f === 2 ? f2!.score : f3!.score}%)`
                : locked
                  ? `🔒 ${label}`
                  : label}
            </button>
          );
        })}
      </div>
      {fase === 1 && (
        <RondaQuiz
          quiz={quiz}
          prev={f1?.score}
          nombre={nombre}
          onPass={(s) => {
            saveFase(1, { score: s });
            setF1({ score: s });
            setFase(2);
          }}
        />
      )}
      {fase === 2 && f1 && (
        <RondaBloques
          reto={reto}
          onPass={(s) => {
            saveFase(2, { score: s });
            setF2({ score: s });
            setFase(3);
          }}
        />
      )}
      {fase === 3 && f1 && f2 && (
        <RondaProyecto
          s1={f1.score}
          s2={f2.score}
          onPass={(s3, slug) => {
            saveFase(3, { score: s3, extra: slug });
            setF3({ score: s3, extra: slug });
            void graduar(f1.score, f2.score, s3, slug);
          }}
        />
      )}
    </div>
  );
}

function RondaQuiz({
  quiz,
  prev,
  nombre,
  onPass,
}: {
  quiz: ReturnType<typeof pickQuiz>;
  prev?: number;
  nombre: string;
  onPass: (s: number) => void;
}) {
  const [ans, setAns] = useState<Record<number, number>>({});
  const [started, setStarted] = useState(false);
  const { notify } = useNotice();
  const corregir = () => {
    if (!nombre.trim()) {
      notify("Escribe tu nombre arriba para el certificado ✏️", "error");
      return;
    }
    addAttempt();
    const s = quizScore(quiz, ans);
    if (s < 90) {
      notify(
        `Sacaste ${s}%. Necesitas 90%+. Repasa y reintenta 💪`,
        "error",
      );
      return;
    }
    onPass(s);
  };
  const { label, urgent } = useCountdown(started, F1_MIN, corregir);

  if (!started) {
    return (
      <div className="rounded-3xl border-4 border-[#1a1523] p-5 text-center">
        <p className="font-display text-xl font-extrabold">
          📝 Ronda 1: Quiz infernal
        </p>
        <p className="text-sm mt-1">
          25 preguntas (7 HTML + 6 CSS + 6 JS + 6 mixtas) · las peso 2 valen
          doble · 90% mínimo · ⏱️ {F1_MIN} min, al acabarse se califica solo.
        </p>
        {prev !== undefined && (
          <p className="text-sm font-bold text-green-600 mt-1">
            Ya la pasaste con {prev}% — puedes mejorar nota.
          </p>
        )}
        <button
          onClick={() => setStarted(true)}
          className="mt-3 rounded-2xl bg-[#FF6B35] text-white font-extrabold px-6 py-3"
        >
          ⚔️ Empezar ronda
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <div
        className={`sticky top-16 z-10 rounded-2xl border-4 px-4 py-2 font-extrabold text-center ${urgent ? "bg-red-500 text-white" : "bg-white"}`}
      >
        ⏱️ {label} · Ronda 1
      </div>
      {quiz.map((q, i) => (
        <div
          key={i}
          className="rounded-2xl border-2 border-[#1a1523] p-3 bg-white"
        >
          <p className="font-bold">
            {i + 1}. {q.q}{" "}
            {q.peso === 2 && (
              <span className="text-xs bg-[#a855f7] text-white rounded-full px-2 py-0.5">
                x2
              </span>
            )}
          </p>
          <div className="grid sm:grid-cols-2 gap-2 mt-2">
            {q.opciones.map((op, j) => (
              <button
                key={j}
                onClick={() => setAns({ ...ans, [i]: j })}
                className={`rounded-xl border-2 px-3 py-2 text-sm font-bold text-left ${ans[i] === j ? "bg-[#FFC700]/50 border-[#1a1523]" : "border-black/10"}`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={corregir}
        className="rounded-2xl bg-[#FF6B35] text-white font-extrabold py-3 block-shadow-sm"
      >
        ⚔️ Entregar ronda 1
      </button>
    </div>
  );
}

function RondaBloques({
  reto,
  onPass,
}: {
  reto: (typeof RETOS)[number];
  onPass: (s: number) => void;
}) {
  const [gen, setGen] = useState<Generated>({
    html: "",
    css: "",
    js: "",
    srcDoc: "",
    count: 0,
    types: [],
    purged: [],
  });
  const [started, setStarted] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);

  if (!started) {
    return (
      <div className="rounded-3xl border-4 border-[#2563EB] p-5 text-center">
        <p className="font-display text-xl font-extrabold">
          🧱 Ronda 2: {reto.titulo}
        </p>
        <p className="text-sm mt-1">{reto.brief}</p>
        <p className="text-sm mt-1 opacity-70">
          ⏱️ {F2_MIN} min (al acabarse se califica lo construido) · 90%+ · tu
          imagen debe ser SUBIDA en 📁, no URL.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="mt-3 rounded-2xl bg-[#2563EB] text-white font-extrabold px-6 py-3"
        >
          ⚔️ Empezar ronda
        </button>
      </div>
    );
  }
  return (
    <ValidadorBloques
      reto={reto}
      gen={gen}
      setGen={setGen}
      missing={missing}
      setMissing={setMissing}
      onPass={onPass}
    />
  );
}

function ValidadorBloques({
  reto,
  gen,
  setGen,
  missing,
  setMissing,
  onPass,
}: {
  reto: (typeof RETOS)[number];
  gen: Generated;
  setGen: (g: Generated) => void;
  missing: string[];
  setMissing: (m: string[]) => void;
  onPass: (s: number) => void;
}) {
  const { notify } = useNotice();
  const validar = (timeout = false) => {
    addAttempt();
    const r = checkReto(reto, gen);
    setMissing(
      timeout && r.score < 90
        ? [...r.missing, "⏱️ Se acabó el tiempo: se calificó lo construido."]
        : r.missing,
    );
    if (r.score >= 90) onPass(r.score);
    else if (!timeout)
      notify(`Llevas ${r.score}%. Revisa lo que falta abajo 👇`, "error");
  };
  const { label, urgent } = useCountdown(true, F2_MIN, () => validar(true));
  return (
    <div className="flex flex-col gap-3">
      <div
        className={`sticky top-16 z-10 rounded-2xl border-4 px-4 py-2 font-extrabold text-center ${urgent ? "bg-red-500 text-white" : "bg-white"}`}
      >
        ⏱️ {label} · {reto.titulo}
      </div>
      <p className="text-sm rounded-2xl border-2 p-3">🎯 {reto.brief}</p>
      <MiniEditor
        lessonId="examen-f2"
        curso="js"
        gen={gen}
        onChange={setGen}
        showFiles
        previewTitle="examen-f2"
        instruccion={`🧱 Ronda 2: ${reto.titulo}`}
        estado={`${gen.count} bloques`}
      />
      {missing.length > 0 && (
        <ul className="text-sm rounded-2xl border-2 border-red-400 p-3 list-disc ml-5">
          {missing.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
      <button
        onClick={() => validar(false)}
        className="rounded-2xl bg-[#2563EB] text-white font-extrabold py-3"
      >
        ⚔️ Validar ronda 2 (90%+)
      </button>
    </div>
  );
}

function RondaProyecto({
  s1,
  s2,
  onPass,
}: {
  s1: number;
  s2: number;
  onPass: (s3: number, slug: string) => void;
}) {
  const [gen, setGen] = useState<Generated>({
    html: "",
    css: "",
    js: "",
    srcDoc: "",
    count: 0,
    types: [],
    purged: [],
  });
  const [missing, setMissing] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const { notify, celebrate } = useNotice();
  const publicar = async () => {
    addAttempt();
    const r = checkProyecto(gen);
    setMissing(r.missing);
    if (r.score < 90) {
      notify(`Tu sitio lleva ${r.score}%. Revisa lo que falta abajo 👇`, "error");
      return;
    }
    setBusy(true);
    try {
      const slug = `examen-final-${Math.random().toString(36).slice(2, 6)}`;
      const res = await publishProject({
        slug,
        nombre: "Mi sitio final",
        html: gen.srcDoc,
        bloques: gen.types,
      });
      celebrate({
        title: "¡Sitio publicado! 🌐",
        sub: res.message,
        actions: [{ label: "Ver mi sitio", href: `/p/${slug}`, primary: true }],
      });
      onPass(r.score, slug);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-3xl border-4 border-[#a855f7] p-4">
        <p className="font-display text-xl font-extrabold">
          🌐 Ronda 3: tu primer sitio real
        </p>
        <p className="text-sm mt-1">
          Construye con bloques una página con header/nav, galería de 3+
          imágenes TUYAS, estilos responsive y un JS que reaccione a clics. Sin
          tiempo, pero el chequeo exige 90%.
        </p>
        <p className="text-sm mt-1 opacity-70">
          Tu nota: 40% quiz ({s1}%) + 30% bloques ({s2}%) + 30% proyecto ·
          mínimo 90 global.
        </p>
      </div>
      <MiniEditor
        lessonId="examen-f3"
        curso="js"
        gen={gen}
        onChange={setGen}
        showFiles
        previewTitle="examen-final"
        instruccion="🌐 Ronda 3: header/nav + 3 imágenes + responsive + JS con clic"
        estado={`${gen.count} bloques`}
      />
      {missing.length > 0 && (
        <ul className="text-sm rounded-2xl border-2 border-red-400 p-3 list-disc ml-5">
          {missing.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
      <button
        onClick={publicar}
        disabled={busy}
        className="rounded-2xl bg-[#a855f7] text-white font-extrabold py-3 disabled:opacity-50"
      >
        {busy ? "⏳ Publicando..." : "🌐 Publicar mi sitio y graduarme"}
      </button>
    </div>
  );
}

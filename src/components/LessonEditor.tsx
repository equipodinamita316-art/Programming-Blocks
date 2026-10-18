"use client";

import { useEffect, useMemo, useState } from "react";
import { markDoneVerified, isDone } from "@/lib/store";
import { useNotice } from "@/lib/notice";
import { Bloqui } from "./Bloqui";
import { Icon } from "./Icon";
import {
  DIFICULTAD_META,
  getIntro,
  getLabDecision,
  getBossChecklist,
  type Leccion,
} from "@/data/cursos";
import { validateLesson, proofHash, type CheckResult } from "@/lib/verification";
import { starterXmlFromCode, starterXmlForBoss } from "@/lib/blockly/starter";
import { shuffleQuiz } from "@/lib/quiz";
import { ALLOW } from "@/lib/blockly/scope";
import {
  StepWizard,
  loadStep,
  loadMaxStep,
  saveStep,
  saveMaxStep,
  type Paso,
} from "./StepWizard";
import { MiniEditor } from "./MiniEditor";
import { CodeView } from "./CodeView";
import { combineSrcDoc } from "@/lib/blockly/generators";
import type { Generated } from "./BlocklyReal";

// Separa un snippet de ejemplo en html/css/js para la vista de código.
function splitExample(code: string): { html: string; css: string; js: string } {
  const css: string[] = [];
  const js: string[] = [];
  const html = code
    .replace(/<!doctype[^>]*>/gi, "")
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_m, c: string) => {
      css.push(c.trim());
      return "";
    })
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (_m, c: string) => {
      js.push(c.trim());
      return "";
    })
    .trim();
  return { html, css: css.join("\n"), js: js.join("\n") };
}

export function LessonEditor({ leccion }: { leccion: Leccion }) {
  // SSR-safe: primer render siempre paso 0 / seed fijo; el avance real se hidrata en cliente.
  const [paso, setPaso] = useState<Paso>(0);
  const [max, setMax] = useState<Paso>(0);
  const [mounted, setMounted] = useState(false);
  const [gen, setGen] = useState<Generated>({
    html: "",
    css: "",
    js: "",
    srcDoc: "",
    count: 0,
    types: [],
    purged: [],
  });
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizSeed, setQuizSeed] = useState(12345);
  const [hintIdx, setHintIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [showSol, setShowSol] = useState(false);
  const { celebrate } = useNotice();
  useEffect(() => {
    // Client-only: paso, seed y progreso viven en localStorage; hidratar tras montar evita mismatch SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPaso(loadStep(leccion.id));
    setMax(loadMaxStep(leccion.id));
    setQuizSeed(Math.floor(Math.random() * 1e9));
    setDone(isDone(leccion.id));
    setMounted(true);
  }, [leccion.id]);

  const quizMixed = useMemo(
    () => shuffleQuiz(leccion.quiz, quizSeed),
    [leccion.quiz, quizSeed],
  );
  const meta = DIFICULTAD_META[leccion.dificultad];
  const intro = getIntro(leccion);
  const ejemplo = useMemo(() => {
    if (!leccion.ejemplo) return null;
    const parts = splitExample(leccion.ejemplo);
    // Para la preview quitamos los envoltorios html/head/body (combineSrcDoc ya los
    // aporta), conservando title/meta para que se suban al <head> real.
    const cleanHtml = parts.html
      .replace(/<\/?(?:html|head|body)\b[^>]*>/gi, "")
      .trim();
    return {
      ...parts,
      preview: combineSrcDoc(cleanHtml, parts.css, parts.js),
    };
  }, [leccion.ejemplo]);
  // Proyecto inicial en bloques (codigoInicial) y proyecto roto del Boss.
  const starterMision = useMemo(
    () => starterXmlFromCode(leccion.codigoInicial),
    [leccion.codigoInicial],
  );
  const starterBoss = useMemo(
    () => starterXmlForBoss(leccion.codigoInicial, leccion.bossCodigoRoto),
    [leccion.codigoInicial, leccion.bossCodigoRoto],
  );

  const go = (p: Paso) => {
    if (p > max) return;
    setPaso(p);
    saveStep(leccion.id, p);
  };
  const unlock = (p: Paso) => {
    setMax((m) => {
      const n = (Math.max(m, p) > 4 ? 4 : Math.max(m, p)) as Paso;
      saveMaxStep(leccion.id, n);
      saveStep(leccion.id, p);
      return n;
    });
    setPaso(p);
  };
  void mounted;

  const allowed = ALLOW[leccion.curso];
  const validTypes = gen.types.filter((t) => allowed.has(t));
  const forbidden = gen.types.filter((t) => !allowed.has(t));
  const hasAsset = gen.types.some(
    (t) =>
      t === "bw_img_asset" ||
      t === "bw_video_asset" ||
      t === "bw_img" ||
      t === "bw_video",
  );

  const missionOk =
    validTypes.length >= 2 &&
    forbidden.length === 0 &&
    gen.html.replace(/\s/g, "").length > 10;
  const labOk = validTypes.length >= 3 && forbidden.length === 0;
  const isBoss = leccion.dificultad === "Boss";

  const full = validateLesson(leccion, {
    blockTypes: gen.types,
    html: gen.html,
    css: gen.css,
    js: gen.js,
    quizPassed,
  });
  const bossAssetOk = hasAsset;
  const bossOk = full.ok && bossAssetOk;

  const finish = async (publish: boolean) => {
    if (!bossOk) return;
    const proof = proofHash(leccion.id, gen.types, quizSeed, leccion.xp);
    const ok = markDoneVerified(leccion.id, {
      blockTypes: gen.types,
      quizSeed,
      proof,
    });
    if (!ok) return;
    if (publish) {
      const slug = `${leccion.id}-${Math.random().toString(36).slice(2, 6)}`;
      const { publishProject } = await import("@/lib/projects");
      const r = await publishProject({
        slug,
        nombre: leccion.titulo,
        html: gen.srcDoc,
        bloques: gen.types,
      });
      setDone(true);
      celebrate({
        title: isBoss ? "¡Boss vencido!" : "¡Lección terminada!",
        sub: r.message,
        xp: full.xp,
        actions: [
          { label: "Ver mi página", href: `/p/${slug}`, primary: true },
          { label: "Salir al mapa", href: "/dashboard" },
        ],
      });
    } else {
      setDone(true);
      celebrate({
        title: "¡Lección terminada!",
        xp: full.xp,
        actions: [{ label: "Salir al mapa", href: "/dashboard", primary: true }],
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Bloqui mood={done ? "wow" : bossOk ? "wow" : "think"} size={52} />
        <div className="flex-1">
          <h1 className="font-display text-2xl md:text-3xl font-extrabold">
            {leccion.titulo}
          </h1>
          <p className="flex flex-wrap items-center gap-1.5 text-sm opacity-70">
            <span className="flex items-center gap-1">
              Solo bloques <Icon name="bricks" size={14} />
            </span>
            ·
            <b className="flex items-center gap-1" style={{ color: meta.color }}>
              <Icon name={meta.icon} size={14} />
              {meta.label} · +{leccion.xp} XP
            </b>
            · {leccion.curso.toUpperCase()}
          </p>
          <div className="mt-2">
            <StepWizard paso={paso} max={done ? 4 : max} onGo={go} />
          </div>
        </div>
        {done && (
          <span className="flex items-center gap-1 rounded-full bg-green-500 text-white text-xs font-bold px-3 py-1">
            <Icon name="check" size={13} />
            Verificada
          </span>
        )}
      </div>

      {/* PASO 0 APRENDE */}
      {paso === 0 && (
        <section className="rounded-3xl border-4 border-[#1a1523] bg-white p-5 block-shadow">
          <h2 className="flex items-center gap-2 font-display text-xl font-extrabold">
            <Icon name="book" size={20} />
            Lo que verás en esta lección
          </h2>
          {intro.parrafos.map((p) => (
            <p key={p} className="mt-2">
              {p}
            </p>
          ))}

          {leccion.pasos && leccion.pasos.length > 0 && (
            <div className="mt-4">
              <h3 className="flex items-center gap-1.5 font-display font-extrabold text-sm">
                <Icon name="clipboardList" size={15} />
                Cómo se hace, paso a paso
              </h3>
              <ol className="mt-1.5 flex flex-col gap-1 text-sm">
                {leccion.pasos.map((s, i) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1a1523] text-white text-[11px] font-bold">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3 mt-4">
            <div className="rounded-2xl border-2 overflow-hidden bg-[var(--background)]">
              <div className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 bg-black/5">
                <Icon name="play" size={13} />
                Resultado del ejemplo
              </div>
              {ejemplo ? (
                <iframe
                  title={`Ejemplo ${leccion.titulo}`}
                  sandbox="allow-scripts"
                  srcDoc={ejemplo.preview}
                  className="w-full h-[300px] bg-white"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`https://placehold.co/600x220/1a1523/FFC700?text=${encodeURIComponent(leccion.titulo.slice(0, 24))}`}
                  alt={`Ejemplo ${leccion.titulo}`}
                  className="w-full"
                />
              )}
            </div>
            <div className="flex flex-col">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold">
                <Icon name="keyboard" size={13} />
                Código del ejemplo
              </div>
              {ejemplo ? (
                <CodeView
                  key={leccion.id}
                  html={ejemplo.html}
                  css={ejemplo.css}
                  js={ejemplo.js}
                  hideEmpty
                />
              ) : (
                <p className="text-sm opacity-70">
                  En esta lección aprenderás con bloques, sin código todavía.
                </p>
              )}
            </div>
          </div>

          <ul className="mt-3 text-sm list-disc ml-5 opacity-80">
            {intro.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <button
            onClick={() => unlock(1)}
            className="mt-4 flex items-center gap-2 rounded-2xl bg-[#1a1523] text-white font-extrabold px-6 py-3"
          >
            Entendido · ir a la Misión
            <Icon name="target" size={18} />
          </button>
        </section>
      )}

      {/* PASO 1 MISION */}
      {paso === 1 && (
        <div className="flex flex-col gap-3">
          <section className="rounded-2xl border-2 p-3 bg-white">
            <h2 className="flex items-center gap-2 font-display font-extrabold">
              <Icon name="target" size={18} />
              Misión principal
            </h2>
            <p className="mt-1 text-sm">{leccion.mision}</p>
            <p className="mt-1 flex items-start gap-1.5 text-xs rounded-xl bg-black/5 p-2">
              <Icon name="lightbulb" size={14} className="mt-0.5 shrink-0" />
              <span>{leccion.concepto}</span>
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => go(0)}
                className="flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-sm font-bold"
              >
                <Icon name="arrowLeft" size={16} />
                Aprende
              </button>
              <button
                onClick={() => unlock(2)}
                disabled={!missionOk}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl font-bold py-2 text-sm ${missionOk ? "bg-[#FF6B35] text-white" : "bg-black/10 opacity-50 cursor-not-allowed"}`}
              >
                Completar misión · Lab
                <Icon name="palette" size={16} />
              </button>
            </div>
          </section>
          <Objetivos checks={full.checks} />
          <MiniEditor
            lessonId={leccion.id}
            curso={leccion.curso}
            gen={gen}
            onChange={setGen}
            showFiles={false}
            previewTitle={leccion.id}
            starterXml={starterMision}
            instruccion={<>Misión: {leccion.mision}</>}
            estado={
              missionOk ? (
                <>
                  <Icon name="check" size={13} className="inline -mt-0.5" /> Lista
                </>
              ) : (
                <>
                  <Icon name="bricks" size={13} className="inline -mt-0.5" />{" "}
                  {validTypes.length}/2
                </>
              )
            }
          />
        </div>
      )}

      {/* PASO 2 LAB */}
      {paso === 2 && (
        <div className="flex flex-col gap-3">
          <section className="rounded-2xl border-2 border-[#2563EB] p-3 bg-white">
            <h2 className="flex items-center gap-2 font-display font-extrabold">
              <Icon name="palette" size={18} />
              Laboratorio libre — tú decides
            </h2>
            <p className="text-sm mt-1 font-bold">{getLabDecision(leccion)}</p>
            <ul className="list-disc ml-5 mt-1 text-xs">
              {leccion.labLibre.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => go(1)}
                className="flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-sm font-bold"
              >
                <Icon name="arrowLeft" size={16} />
                Misión
              </button>
              <button
                onClick={() => unlock(3)}
                disabled={!labOk}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl font-bold py-2 text-sm ${labOk ? "bg-[#2563EB] text-white" : "bg-black/10 opacity-50 cursor-not-allowed"}`}
              >
                Ir al Quiz
                <Icon name="check" size={16} />
              </button>
            </div>
          </section>
          <MiniEditor
            lessonId={leccion.id}
            curso={leccion.curso}
            gen={gen}
            onChange={setGen}
            showFiles
            previewTitle={leccion.id}
            starterXml={starterMision}
            instruccion="Lab: decide tu tema, sube archivos y arma tu página"
            estado={
              labOk ? (
                <>
                  <Icon name="check" size={13} className="inline -mt-0.5" /> Listo
                </>
              ) : (
                <>
                  <Icon name="bricks" size={13} className="inline -mt-0.5" />{" "}
                  {validTypes.length}/3
                </>
              )
            }
          />
        </div>
      )}

      {/* PASO 3 QUIZ */}
      {paso === 3 && (
        <section className="w-full rounded-3xl border-4 border-[#1a1523] bg-white p-4 md:p-8 block-shadow">
          <h2 className="flex items-center gap-2 font-display text-2xl md:text-3xl font-extrabold">
            <Icon name="check" size={26} />
            Quiz (aleatorio, 100%)
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm md:text-base opacity-70">
            Responde todo bien para desbloquear el Boss final
            <Icon name="boss" size={16} />
          </p>
          {mounted ? (
            <QuizHard
              key={quizSeed}
              quiz={quizMixed}
              onPass={() => {
                setQuizPassed(true);
                unlock(4);
              }}
            />
          ) : (
            <p className="mt-2 flex items-center gap-1.5 text-sm opacity-70">
              <Icon name="hourglass" size={14} />
              Cargando quiz...
            </p>
          )}
          {quizPassed && (
            <div className="mt-3 rounded-xl border-2 border-dashed p-3 text-sm md:text-base">
              <button
                onClick={() => setShowSol(!showSol)}
                className="font-bold underline"
              >
                {showSol ? "Ocultar referencia" : "Ver referencia"}
              </button>
              {showSol && (
                <pre className="mt-2 text-xs md:text-sm bg-black text-green-200 p-3 rounded-xl overflow-auto">
                  {leccion.solucion}
                </pre>
              )}
            </div>
          )}
          <div className="mt-4 flex gap-2 rounded-2xl border-2 border-[#1a1523] bg-[var(--background)] p-2">
            <button
              onClick={() => go(2)}
              className="flex items-center gap-1.5 rounded-xl border-2 px-4 py-3 text-sm md:text-base font-bold"
            >
              <Icon name="arrowLeft" size={16} />
              Lab
            </button>
            {quizPassed && (
              <button
                onClick={() => go(4)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#a855f7] text-white font-extrabold py-3 text-sm md:text-lg"
              >
                Ir al Boss final
                <Icon name="boss" size={18} />
              </button>
            )}
          </div>
        </section>
      )}

      {/* PASO 4 BOSS */}
      {paso === 4 && (
        <div className="flex flex-col gap-3">
          <section className="rounded-2xl border-2 border-[#a855f7] p-3 bg-white">
            <h2 className="flex items-center gap-2 font-display font-extrabold">
              <Icon name="boss" size={18} />
              Boss final — publica tu página
              <Icon name="globe" size={18} />
            </h2>
            <p className="text-sm mt-1">{leccion.boss}</p>
            <ul className="mt-1 text-xs list-disc ml-5">
              {getBossChecklist(leccion).map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="mt-1 flex items-start gap-1.5 text-xs rounded-xl bg-[#a855f7]/10 p-2">
              <Icon name="brush" size={14} className="mt-0.5 shrink-0" />
              <span>
                El editor ya viene con un <b>proyecto roto</b>: arregla y añade
                bloques hasta cumplir todos los objetivos.
              </span>
            </p>
            <div className="mt-2">
              <Objetivos checks={full.checks} showHints />
            </div>
            <div className="mt-1 text-xs">
              {!quizPassed && (
                <p className="flex items-center gap-1.5 font-bold text-red-600">
                  <Icon name="lock" size={14} />
                  Aprueba el Quiz primero.
                </p>
              )}
              {!hasAsset && (
                <p className="flex items-center gap-1.5 font-bold">
                  <Icon name="folder" size={14} />
                  Falta: sube 1 imagen/video y úsalo con el bloque de archivos.
                </p>
              )}
              {bossOk && (
                <p className="flex items-center gap-1.5 font-bold text-green-600">
                  <Icon name="check" size={14} />
                  Boss verificable · +{full.xp} XP — usa
                  <Icon name="play" size={13} />
                  Probar y luego Publicar
                </p>
              )}
            </div>
            <div className="flex gap-2 mt-2 flex-col sm:flex-row">
              <button
                onClick={() => go(3)}
                className="flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-sm font-bold"
              >
                <Icon name="arrowLeft" size={16} />
                Quiz
              </button>
              <button
                onClick={() => finish(true)}
                disabled={!bossOk}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl font-bold py-2 text-sm ${bossOk ? "bg-[#a855f7] text-white" : "bg-black/10 opacity-50 cursor-not-allowed"}`}
              >
                <Icon name="globe" size={16} />
                Publicar y completar +{leccion.xp} XP
              </button>
            </div>
            <div className="mt-1">
              <button
                onClick={() =>
                  setHintIdx((i) => Math.min(i + 1, leccion.pistas.length))
                }
                className="flex items-center gap-1.5 text-xs font-bold underline"
              >
                <Icon name="lightbulb" size={14} />
                Pista ({hintIdx}/{leccion.pistas.length})
              </button>
              {hintIdx > 0 && (
                <ul className="text-xs mt-1 list-disc ml-5">
                  {leccion.pistas.slice(0, hintIdx).map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
          <MiniEditor
            lessonId={leccion.id}
            curso={leccion.curso}
            gen={gen}
            onChange={setGen}
            showFiles
            previewTitle={leccion.id}
            starterXml={starterBoss}
            storageSuffix="boss"
            instruccion="Boss: arregla el proyecto roto con bloques + 1 imagen/video, prueba y publica"
            estado={
              <>
                {bossOk ? (
                  <>
                    <Icon name="check" size={13} className="inline -mt-0.5" />{" "}
                    Verificable
                  </>
                ) : (
                  <>
                    <Icon name="bricks" size={13} className="inline -mt-0.5" />{" "}
                    {gen.count}
                  </>
                )}
              </>
            }
            onPublish={() => finish(true)}
            publishLabel={`Publicar +${leccion.xp} XP`}
          />
        </div>
      )}
    </div>
  );
}

function Objetivos({
  checks,
  showHints = false,
}: {
  checks: CheckResult[];
  showHints?: boolean;
}) {
  if (!checks.length) return null;
  const done = checks.filter((c) => c.ok).length;
  const allDone = done === checks.length;
  return (
    <section
      className={`rounded-2xl border-2 p-3 ${allDone ? "border-green-500 bg-green-50" : "border-[#1a1523]/20 bg-white"}`}
    >
      <h3 className="flex items-center gap-2 font-display font-extrabold text-sm">
        <Icon name="target" size={16} />
        Objetivos {done}/{checks.length}
        {allDone && <Icon name="check" size={15} className="text-green-600" />}
      </h3>
      <ul className="mt-1.5 flex flex-col gap-1 text-sm">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-1.5">
            <Icon
              name={c.ok ? "check" : "circle"}
              size={14}
              className={`mt-0.5 shrink-0 ${c.ok ? "text-green-600" : "opacity-30"}`}
            />
            <span className={c.ok ? "opacity-60 line-through" : ""}>
              {c.label}
              {!c.ok && showHints && (
                <span className="block text-xs opacity-70">{c.hint}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuizHard({
  quiz,
  onPass,
}: {
  quiz: Leccion["quiz"];
  onPass: () => void;
}) {
  const { notify } = useNotice();
  const [ans, setAns] = useState<Record<number, number>>({});
  const [ok, setOk] = useState(false);
  const [fails, setFails] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!lockUntil) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [lockUntil]);
  if (!quiz.length) return <p className="text-sm opacity-70">Sin quiz.</p>;
  const locked = now < lockUntil;
  const answered = quiz.filter((_, i) => ans[i] !== undefined).length;
  const pct = Math.round((answered / quiz.length) * 100);
  return (
    <div className="flex flex-col gap-3 mt-3">
      <div>
        <div className="flex justify-between text-xs md:text-sm font-bold mb-1">
          <span>
            Respondidas {answered}/{quiz.length}
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-[#FFC700] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {quiz.map((q, i) => (
          <div
            key={i}
            className="rounded-2xl border-2 border-[#1a1523]/20 p-3 md:p-4"
          >
            <p className="text-base md:text-lg font-bold">
              {i + 1}. {q.q}
            </p>
            <div className="grid gap-2 mt-2">
              {q.opciones.map((op, j) => (
                <button
                  key={j}
                  onClick={() => setAns({ ...ans, [i]: j })}
                  className={`text-left text-sm md:text-base rounded-xl border-2 px-3 py-2 md:py-3 font-bold ${ans[i] === j ? "bg-[#FFC700]/40 border-[#1a1523]" : "border-black/10 hover:border-black/30"}`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        disabled={locked}
        onClick={() => {
          const pass = quiz.every((q, i) => ans[i] === q.correcta);
          if (pass) {
            setOk(true);
            onPass();
          } else {
            const f = fails + 1;
            setFails(f);
            const until = Date.now() + Math.min(20000, f * 5000);
            setLockUntil(until);
            setNow(Date.now());
            notify(`Aún no (intento ${f}) — repasa y reintenta`, "error");
          }
        }}
        className="rounded-2xl bg-[#1a1523] text-white font-extrabold py-3 md:py-4 text-base md:text-lg disabled:opacity-50"
      >
        {locked
          ? `Espera ${Math.max(1, Math.ceil((lockUntil - now) / 1000))}s...`
          : "Comprobar quiz"}
      </button>
      {ok && (
        <p className="flex items-center gap-1.5 text-green-600 text-sm md:text-base font-bold">
          <Icon name="check" size={16} />
          Quiz superado — ya puedes ir al Boss
          <Icon name="boss" size={16} />
        </p>
      )}
    </div>
  );
}

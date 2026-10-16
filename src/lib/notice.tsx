"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Bloqui } from "@/components/Bloqui";

export type ToastKind = "info" | "exito" | "error";
export type ToastAction = { label: string; href: string };
type Toast = { id: number; text: string; kind: ToastKind; action?: ToastAction };

export type CelebAction = { label: string; href?: string; primary?: boolean };
export type CelebData = { title: string; sub?: string; xp?: number; actions: CelebAction[] };
export type DangerData = { title: string; body?: string; confirmLabel: string };

type NoticeCtx = {
  notify: (text: string, kind?: ToastKind, action?: ToastAction) => void;
  celebrate: (c: CelebData) => void;
  askDanger: (d: DangerData) => Promise<boolean>;
};

const Ctx = createContext<NoticeCtx>({
  notify: () => {},
  celebrate: () => {},
  askDanger: async () => false,
});

export function useNotice() {
  return useContext(Ctx);
}

export function NoticeProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [celeb, setCeleb] = useState<CelebData | null>(null);
  const [danger, setDanger] = useState<DangerData | null>(null);
  const idRef = useRef(1);
  const dangerResolve = useRef<((v: boolean) => void) | null>(null);

  const notify = useCallback((text: string, kind: ToastKind = "info", action?: ToastAction) => {
    const id = idRef.current++;
    setToasts((ts) => [...ts.slice(-3), { id, text, kind, action }]);
    setTimeout(() => {
      setToasts((ts) => ts.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const celebrate = useCallback((c: CelebData) => setCeleb(c), []);

  const askDanger = useCallback((d: DangerData) => {
    setDanger(d);
    return new Promise<boolean>((res) => {
      dangerResolve.current = res;
    });
  }, []);

  const closeDanger = (v: boolean) => {
    setDanger(null);
    dangerResolve.current?.(v);
    dangerResolve.current = null;
  };

  return (
    <Ctx.Provider value={{ notify, celebrate, askDanger }}>
      {children}
      <NoticeHost
        toasts={toasts}
        celeb={celeb}
        danger={danger}
        dismissToast={(id) => setToasts((ts) => ts.filter((t) => t.id !== id))}
        closeCeleb={() => setCeleb(null)}
        closeDanger={closeDanger}
      />
    </Ctx.Provider>
  );
}

const TOAST_STYLE: Record<ToastKind, string> = {
  info: "bg-white",
  exito: "bg-green-100",
  error: "bg-red-100",
};

function NoticeHost({ toasts, celeb, danger, dismissToast, closeCeleb, closeDanger }: {
  toasts: Toast[];
  celeb: CelebData | null;
  danger: DangerData | null;
  dismissToast: (id: number) => void;
  closeCeleb: () => void;
  closeDanger: (v: boolean) => void;
}) {
  useEffect(() => {
    if (!celeb && !danger) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (danger) closeDanger(false);
        else closeCeleb();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [celeb, danger, closeCeleb, closeDanger]);

  return (
    <>
      {/* Toasts: arriba en móvil (no tapa la bottom bar), abajo-derecha en desktop */}
      <div aria-live="polite" className="fixed z-[100002] top-3 inset-x-3 sm:inset-x-auto sm:top-auto sm:bottom-6 sm:right-6 flex flex-col gap-2 items-stretch sm:items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`rounded-2xl border-4 border-[#1a1523] px-4 py-2.5 font-bold text-sm block-shadow-sm flex items-center gap-2 ${TOAST_STYLE[t.kind]}`}
          >
            <span className="flex-1">{t.text}</span>
            {t.action && (
              <Link href={t.action.href} onClick={() => dismissToast(t.id)} className="rounded-lg bg-[#1a1523] text-white px-2 py-1 text-xs font-extrabold whitespace-nowrap">
                {t.action.label}
              </Link>
            )}
            <button onClick={() => dismissToast(t.id)} aria-label="Cerrar aviso" className="font-extrabold opacity-60">✕</button>
          </div>
        ))}
      </div>

      {/* Modal celebración */}
      {celeb && (
        <div className="fixed inset-0 z-[100003] flex items-center justify-center bg-black/60 p-4" onClick={closeCeleb} role="alertdialog" aria-modal="true" aria-label={celeb.title}>
          <div className="w-full max-w-[440px] rounded-3xl border-4 border-[#1a1523] bg-[#fff8ec] p-6 text-center block-shadow" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center"><Bloqui mood="wow" size={72} /></div>
            <h2 className="font-display text-2xl font-extrabold mt-2">🎉 {celeb.title}</h2>
            {celeb.sub && <p className="text-sm mt-1 opacity-80">{celeb.sub}</p>}
            {celeb.xp !== undefined && (
              <span className="inline-block mt-2 rounded-full bg-[#FFC700] border-2 border-[#1a1523] px-3 py-1 text-sm font-extrabold">⚡ +{celeb.xp} XP</span>
            )}
            <div className="mt-4 flex flex-col gap-2">
              {celeb.actions.map((a) =>
                a.href ? (
                  <Link key={a.label} href={a.href} onClick={closeCeleb} autoFocus={a.primary} className={`rounded-2xl font-extrabold px-4 py-3 ${a.primary ? "bg-[#1a1523] text-white" : "border-2 border-[#1a1523]"}`}>
                    {a.label}
                  </Link>
                ) : (
                  <button key={a.label} onClick={closeCeleb} className="rounded-2xl border-2 border-[#1a1523] font-extrabold px-4 py-3">
                    {a.label}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal peligro */}
      {danger && (
        <div className="fixed inset-0 z-[100003] flex items-center justify-center bg-black/60 p-4" onClick={() => closeDanger(false)} role="alertdialog" aria-modal="true" aria-label={danger.title}>
          <div className="w-full max-w-[400px] rounded-3xl border-4 border-red-600 bg-[#fff8ec] p-6 text-center block-shadow" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl">⚠️</div>
            <h2 className="font-display text-2xl font-extrabold mt-2 text-red-700">{danger.title}</h2>
            {danger.body && <p className="text-sm mt-1 opacity-80">{danger.body}</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => closeDanger(false)} autoFocus className="rounded-2xl border-2 border-[#1a1523] font-extrabold px-4 py-3">Cancelar</button>
              <button onClick={() => closeDanger(true)} className="rounded-2xl bg-red-600 text-white font-extrabold px-4 py-3">{danger.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

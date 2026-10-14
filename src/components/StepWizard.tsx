"use client";

import { useSyncExternalStore } from "react";

export type Paso = 0 | 1 | 2 | 3 | 4;

export const PASOS = [
  { i: 0, emoji: "📖", label: "Aprende" },
  { i: 1, emoji: "🎯", label: "Misión" },
  { i: 2, emoji: "🎨", label: "Lab Libre" },
  { i: 3, emoji: "✅", label: "Quiz" },
  { i: 4, emoji: "👹", label: "Boss" },
] as const;

export function StepWizard({ paso, max, onGo }: { paso: Paso; max: Paso; onGo: (p: Paso) => void }) {
  return (
    <div className="flex items-center gap-1 overflow-auto no-scrollbar">
      {PASOS.map((s) => {
        const locked = s.i > max;
        const active = s.i === paso;
        const done = s.i < max;
        return (
          <button
            key={s.i}
            disabled={locked}
            onClick={() => onGo(s.i as Paso)}
            className={`shrink-0 flex items-center gap-1 rounded-full border-2 px-3 py-1 text-xs font-extrabold ${active ? "bg-[#1a1523] text-white dark:bg-white dark:text-black border-[#1a1523]" : locked ? "opacity-40 cursor-not-allowed" : done ? "border-green-500 text-green-700" : "border-[#1a1523] dark:border-white/30"}`}
          >
            {locked ? "🔒" : done ? "✅" : s.emoji} {s.label}
          </button>
        );
      })}
    </div>
  );
}

export function stepKey(id: string) {
  return `bw-step-${id}`;
}

export function maxStepKey(id: string) {
  return `bw-step-max-${id}`;
}

export function loadStep(id: string): Paso {
  try {
    const n = Number(localStorage.getItem(stepKey(id)) || 0);
    if (n >= 0 && n <= 4) return n as Paso;
  } catch {}
  return 0;
}

export function loadMaxStep(id: string): Paso {
  try {
    const n = Number(localStorage.getItem(maxStepKey(id)) || 0);
    if (n >= 0 && n <= 4) return n as Paso;
  } catch {}
  return 0;
}

function subscribeStep(id: string, callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === stepKey(id) || event.key === maxStepKey(id)) callback();
  };
  window.addEventListener("bw-step-change", callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("bw-step-change", callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCurrentStep(id: string): Paso {
  return useSyncExternalStore(
    (callback) => subscribeStep(id, callback),
    () => loadStep(id),
    () => 0,
  );
}

export function useMaxStep(id: string): Paso {
  return useSyncExternalStore(
    (callback) => subscribeStep(id, callback),
    () => loadMaxStep(id),
    () => 0,
  );
}

export function saveStep(id: string, p: Paso) {
  try {
    localStorage.setItem(stepKey(id), String(p));
    window.dispatchEvent(new Event("bw-step-change"));
  } catch {}
}

export function saveMaxStep(id: string, p: Paso) {
  try {
    localStorage.setItem(maxStepKey(id), String(p));
    window.dispatchEvent(new Event("bw-step-change"));
  } catch {}
}

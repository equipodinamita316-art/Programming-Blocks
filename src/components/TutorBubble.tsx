"use client";

import { TUTORES, type TutorId } from "@/lib/tutores";

export function TutorBubble({
  who,
  label,
  text,
  className = "",
}: {
  who: TutorId;
  label: string;
  text: string;
  className?: string;
}) {
  const t = TUTORES[who];
  return (
    <div className={`flex items-end gap-2 ${className}`} role="note">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={t.avatar}
        alt={t.nombre}
        width={64}
        height={64}
        draggable={false}
        className="h-16 w-16 shrink-0 select-none object-contain"
      />
      <div className="relative flex-1 rounded-2xl border-2 border-[#1a1523] bg-white px-3 py-2 block-shadow-sm">
        <span
          aria-hidden
          className="absolute -left-[8px] bottom-3 h-3 w-3 rotate-45 border-b-2 border-l-2 border-[#1a1523] bg-white"
        />
        <p
          className="text-[11px] font-extrabold uppercase tracking-wide"
          style={{ color: t.color }}
        >
          {t.nombre} · {label}
        </p>
        <p className="text-sm leading-snug">{text}</p>
      </div>
    </div>
  );
}

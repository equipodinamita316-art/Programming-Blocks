"use client";

import { Icon, type IconName } from "./Icon";

type Mood = "happy" | "think" | "wow" | "sleep";

const FACE: Record<Mood, IconName> = {
  happy: "bloqui-happy",
  think: "bloqui-think",
  wow: "bloqui-wow",
  sleep: "bloqui-sleep",
};

export function Bloqui({ mood = "happy", size = 64 }: { mood?: Mood; size?: number }) {
  return (
    <div
      className="font-display flex items-center justify-center rounded-2xl border-4 border-[#1a1523] bg-[#FFC700] block-shadow select-none text-[#1a1523]"
      style={{ width: size, height: size }}
      title={`Bloqui ${mood}`}
    >
      <Icon name={FACE[mood]} size={Math.round(size * 0.6)} strokeWidth={2.5} />
    </div>
  );
}

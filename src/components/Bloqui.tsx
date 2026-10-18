"use client";

export function Bloqui({ mood = "happy", size = 64 }: { mood?: "happy" | "think" | "wow" | "sleep"; size?: number }) {
  const faces: Record<string, string> = {
    happy: "◕‿◕",
    think: "🤔",
    wow: "✨",
    sleep: "😴",
  };
  return (
    <div
      className="font-display flex items-center justify-center rounded-2xl border-4 border-[#1a1523] bg-[#FFC700] block-shadow select-none"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      title={`Bloqui ${mood}`}
    >
      {faces[mood]}
    </div>
  );
}

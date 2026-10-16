// Mezcla quiz anti-memoria: orden preguntas + orden opciones, recalcula correcta.

export type QuizQ = { q: string; opciones: string[]; correcta: number };

export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleQuiz<T extends QuizQ>(quiz: T[], seed: number): T[] {
  const rnd = mulberry32(seed);
  const qs = [...quiz];
  // Fisher-Yates preguntas
  for (let i = qs.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [qs[i], qs[j]] = [qs[j], qs[i]];
  }
  return qs.map((q) => {
    const idx = q.opciones.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    const opciones = idx.map((i) => q.opciones[i]);
    const correcta = idx.indexOf(q.correcta);
    return { ...q, opciones, correcta };
  });
}

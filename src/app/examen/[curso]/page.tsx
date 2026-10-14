import Link from "next/link";

export default async function ExamenCurso({ params }: { params: Promise<{ curso: string }> }) {
  const { curso } = await params;
  return (
    <div className="max-w-[560px] mx-auto text-center flex flex-col gap-3">
      <h1 className="font-display text-3xl font-extrabold">Quiz {curso.toUpperCase()}</h1>
      <p className="text-sm opacity-70">En MVP los quizzes están dentro de cada lección. El certificado sale del examen final global.</p>
      <Link href="/examen/final" className="rounded-2xl bg-[#1a1523] text-white dark:bg-white dark:text-black font-bold py-3">Ir al examen final →</Link>
      <Link href="/dashboard" className="underline text-sm">Volver al mapa</Link>
    </div>
  );
}

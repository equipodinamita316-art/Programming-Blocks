import { LECCIONES } from "@/data/cursos";
import { LessonEditor } from "@/components/LessonEditor";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function LeccionPage({ params }: { params: Promise<{ curso: string; leccionId: string }> }) {
  const { curso, leccionId } = await params;
  const leccion = LECCIONES.find((l) => l.id === leccionId && l.curso === curso);
  if (!leccion) return notFound();

  const idx = LECCIONES.filter((l) => l.curso === curso).findIndex((l) => l.id === leccionId);
  const next = LECCIONES.filter((l) => l.curso === curso)[idx + 1];

  return (
    <div className="flex flex-col gap-4">
      <Link href="/dashboard" className="text-sm font-bold underline">← Volver al mapa</Link>
      <LessonEditor leccion={leccion} />
      {next && (
        <Link href={`/aprender/${next.curso}/${next.id}`} className="rounded-2xl bg-[#1a1523] text-white dark:bg-white dark:text-black font-extrabold px-4 py-3 text-center">
          Siguiente: {next.titulo} →
        </Link>
      )}
    </div>
  );
}

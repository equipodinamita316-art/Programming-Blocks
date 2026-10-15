import { LECCIONES } from "@/data/cursos";
import { LessonEditor } from "@/components/LessonEditor";
import { LessonGate } from "@/components/LessonGate";
import { notFound } from "next/navigation";

export default async function LeccionPage({ params }: { params: Promise<{ curso: string; leccionId: string }> }) {
  const { curso, leccionId } = await params;
  const leccion = LECCIONES.find((l) => l.id === leccionId && l.curso === curso);
  if (!leccion) return notFound();

  return (
    <div className="flex flex-col gap-4">
      <LessonGate leccionId={leccion.id} curso={leccion.curso}>
        <LessonEditor leccion={leccion} />
      </LessonGate>
    </div>
  );
}

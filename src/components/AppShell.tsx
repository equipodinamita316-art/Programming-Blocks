"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Bloqui } from "./Bloqui";
import { getLevel, getXP } from "@/lib/store";
import { useSession } from "@/lib/supabase/session";
import { useRouter } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={<div className="p-4 font-bold">Cargando BLOCKWEB...</div>}
    >
      <ShellInner>{children}</ShellInner>
    </Suspense>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const router = useRouter();
  const { user, loading, signOut } = useSession();
  const [xp, setXp] = useState(() => getXP());
  const [open, setOpen] = useState(false);

  const salir = async () => {
    await signOut();
    router.replace("/login");
  };

  useEffect(() => {
    const update = () => setXp(getXP());
    window.addEventListener("bw-xp", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("bw-xp", update);
      window.removeEventListener("storage", update);
    };
  }, [path]);

  // El panel se cierra manual (☰/✕) o con Esc; al navegar se queda abierto.

  // Cierre con Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const nav = [
    { href: "/dashboard", label: "Aprender", icon: "🗺️" },
    { href: "/playground", label: "Crear", icon: "🧱" },
    { href: "/proyectos", label: "Plantillas", icon: "🎨" },
    { href: "/certificado", label: "Certificado", icon: "🎓" },
  ];

  const focusMode =
    path.startsWith("/aprender/") || path.startsWith("/examen/");

  // --- Modo enfoque: tira mínima, única salida al dashboard ---
  if (focusMode) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b-4 border-[#1a1523] bg-[var(--background)] px-3 py-2">
          <Link
            href="/dashboard"
            className="rounded-xl border-2 border-[#1a1523] px-3 py-1 text-sm font-extrabold hover:bg-black/5"
          >
            ← Salir del curso
          </Link>
          <span className="flex items-center gap-2 font-display text-lg font-extrabold">
            <Bloqui size={28} />
            <span className="hidden sm:inline">BLOCKWEB</span>
          </span>
          <div className="ml-auto flex items-center gap-2 text-sm font-bold">
            <span>{xp} XP</span>
          </div>
        </header>
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Panel fijo independiente: no se mueve con el scroll, scroll propio */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-screen z-30 flex-col gap-4 border-r-4 border-[#1a1523] bg-[var(--background)] overflow-hidden overflow-y-auto transition-all duration-200 ${
          open ? "w-[260px] p-4 opacity-100" : "w-0 p-0 opacity-0 border-r-0"
        }`}
      >
        <div className={`flex flex-col gap-4 ${open ? "" : "invisible"}`}>
          <Link href="/" className="flex items-center gap-3 whitespace-nowrap">
            <Bloqui size={48} />
            <div>
              <div className="font-display text-2xl font-extrabold leading-none">
                BLOCKWEB
              </div>
              <div className="text-xs opacity-70">aprende creando</div>
            </div>
          </Link>
          <div className="rounded-2xl border-2 border-[#1a1523] p-3">
            <div className="text-sm font-bold">
              {xp} XP · {getLevel(xp)}
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-[#FF6B35]"
                style={{ width: `${Math.min(100, (xp % 300) / 3)}%` }}
              />
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-xl border-2 px-3 py-2 font-bold whitespace-nowrap ${path.startsWith(n.href) ? "bg-[#1a1523] text-white border-[#1a1523]" : "border-[#1a1523] hover:bg-black/5"}`}
              >
                {n.icon} {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2">
            <div className="rounded-xl border-2 border-[#1a1523] px-2 py-1 text-xs font-bold truncate">
              {loading
                ? "⏳..."
                : user
                  ? `👤 ${user.user_metadata?.nombre || user.email}`
                  : "👤 Invitado"}
            </div>
            <Link
              href="/examen/final"
              className="text-sm font-bold underline w-fit"
            >
              Examen final
            </Link>
            {user ? (
              <button
                onClick={salir}
                className="rounded-xl border-2 px-2 py-1 text-xs font-bold opacity-70"
              >
                Salir ⎋
              </button>
            ) : (
              !loading && (
                <Link
                  href="/login"
                  className="rounded-xl bg-[#FF6B35] text-white px-2 py-1 text-xs font-extrabold text-center"
                >
                  Entrar 🔑
                </Link>
              )
            )}
          </div>
        </div>
      </aside>

      <div
        className={`flex min-w-0 flex-1 flex-col transition-all duration-200 ${open ? "lg:ml-[260px]" : ""}`}
      >
        {/* Topbar mínima con botón hamburguesa */}
        <header className="hidden lg:flex sticky top-0 z-20 items-center gap-3 border-b-4 border-[#1a1523] bg-[var(--background)] px-4 py-2">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Cerrar panel" : "Abrir panel"}
            aria-expanded={open}
            className="rounded-xl border-2 border-[#1a1523] px-3 py-1 text-lg font-extrabold hover:bg-black/5"
          >
            {open ? "✕" : "☰"}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Bloqui size={32} />
            <span className="font-display text-xl font-extrabold">
              BLOCKWEB
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2 text-sm font-bold">
            <span>{xp} XP</span>
          </div>
        </header>

        {/* Topbar móvil/tablet (sin cambios) */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between border-b-4 border-[#1a1523] bg-[var(--background)] px-4 py-2">
          <Link href="/" className="flex items-center gap-2">
            <Bloqui size={36} />
            <span className="font-display text-xl font-extrabold">
              BLOCKWEB
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span>{xp} XP</span>
            {user ? (
              <button
                onClick={salir}
                className="rounded-lg border px-1 text-xs opacity-70"
                aria-label="Salir"
              >
                ⎋
              </button>
            ) : (
              !loading && (
                <Link
                  href="/login"
                  className="rounded-lg bg-[#FF6B35] text-white px-2 py-0.5 text-xs font-extrabold"
                >
                  Entrar
                </Link>
              )
            )}
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-8 w-full max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-6">
          {children}
        </main>

        {/* Bottom bar móvil */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 grid grid-cols-4 border-t-4 border-[#1a1523] bg-[var(--background)]">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex flex-col items-center py-2 text-xs font-bold ${path.startsWith(n.href) ? "bg-black/5" : ""}`}
            >
              <span className="text-xl">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

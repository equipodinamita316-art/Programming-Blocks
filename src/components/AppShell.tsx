"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Bloqui } from "./Bloqui";
import { getLevel, getXP } from "@/lib/store";
import { useSession } from "@/lib/supabase/session";
import { useRouter } from "next/navigation";

function ThemeToggle() {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  return (
    <button
      onClick={() => {
        const el = document.documentElement;
        el.classList.toggle("dark");
        const isDark = el.classList.contains("dark");
        setDark(isDark);
        try {
          localStorage.setItem("bw-theme", isDark ? "dark" : "light");
        } catch {}
      }}
      className="rounded-xl border-2 border-[#1a1523] dark:border-white px-2 py-1 text-sm font-bold"
      aria-label="Cambiar tema"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-4 font-bold">Cargando BLOCKWEB...</div>}>
      <ShellInner>{children}</ShellInner>
    </Suspense>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const router = useRouter();
  const { user, loading, signOut } = useSession();
  const [xp, setXp] = useState(() => getXP());

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

  const nav = [
    { href: "/dashboard", label: "Aprender", icon: "🗺️" },
    { href: "/playground", label: "Crear", icon: "🧱" },
    { href: "/proyectos", label: "Plantillas", icon: "🎨" },
    { href: "/certificado", label: "Certificado", icon: "🎓" },
  ];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col gap-4 border-r-4 border-[#1a1523] dark:border-white/20 p-4">
        <Link href="/" className="flex items-center gap-3">
          <Bloqui size={48} />
          <div>
            <div className="font-display text-2xl font-extrabold leading-none">BLOCKWEB</div>
            <div className="text-xs opacity-70">aprende creando</div>
          </div>
        </Link>
        <div className="rounded-2xl border-2 border-[#1a1523] dark:border-white/30 p-3">
          <div className="text-sm font-bold">{xp} XP · {getLevel(xp)}</div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div className="h-full rounded-full bg-[#FF6B35]" style={{ width: `${Math.min(100, (xp % 300) / 3)}%` }} />
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-xl border-2 px-3 py-2 font-bold ${path.startsWith(n.href) ? "bg-[#1a1523] text-white dark:bg-white dark:text-black border-[#1a1523]" : "border-[#1a1523] dark:border-white/30 hover:bg-black/5"}`}
            >
              {n.icon} {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <div className="rounded-xl border-2 border-[#1a1523] dark:border-white/30 px-2 py-1 text-xs font-bold truncate">
            {loading ? "⏳..." : user ? `👤 ${user.user_metadata?.nombre || user.email}` : "👤 Invitado"}
          </div>
          <div className="flex items-center justify-between">
            <Link href="/examen/final" className="text-sm font-bold underline">Examen final</Link>
            <ThemeToggle />
          </div>
          {user && (
            <button onClick={salir} className="rounded-xl border-2 px-2 py-1 text-xs font-bold opacity-70">Salir ⎋</button>
          )}
        </div>
      </aside>

      {/* Topbar móvil/tablet */}
      <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between border-b-4 border-[#1a1523] dark:border-white/20 bg-[var(--background)] px-4 py-2">
        <Link href="/" className="flex items-center gap-2">
          <Bloqui size={36} />
          <span className="font-display text-xl font-extrabold">BLOCKWEB</span>
        </Link>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span>{xp} XP</span>
          {user && (
            <button onClick={salir} className="rounded-lg border px-1 text-xs opacity-70" aria-label="Salir">⎋</button>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 pb-24 lg:pb-8 w-full max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-6">{children}</main>

      {/* Bottom bar móvil */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 grid grid-cols-4 border-t-4 border-[#1a1523] dark:border-white/20 bg-[var(--background)]">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className={`flex flex-col items-center py-2 text-xs font-bold ${path.startsWith(n.href) ? "bg-black/5 dark:bg-white/10" : ""}`}>
            <span className="text-xl">{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

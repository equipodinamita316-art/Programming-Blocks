"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Bloqui } from "@/components/Bloqui";
import { Icon } from "@/components/Icon";
import { createClient } from "@/lib/supabase/client";
import { appUrl } from "@/lib/supabase/session";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [mode, setMode] = useState<"login" | "registro">("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [msgKind, setMsgKind] = useState<"error" | "ok">("error");
  const [busy, setBusy] = useState(false);

  const go = () => router.replace(next);

  const submitEmail = async () => {
    if (!email.includes("@") || pass.length < 6) {
      setMsgKind("error");
      setMsg("Email válido + contraseña de 6+ caracteres.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const supabase = createClient();
      if (mode === "registro") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { nombre: nombre.trim() || email.split("@")[0] },
            emailRedirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        setMsgKind("ok");
        setMsg(
          "Revisa tu correo para confirmar (o entra si ya quedó activa la sesión).",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (error) throw error;
      }
      go();
    } catch (e: unknown) {
      setMsgKind("error");
      setMsg(e instanceof Error ? e.message : "No se pudo entrar");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setMsg("");
    try {
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
    } catch (e: unknown) {
      setBusy(false);
      setMsgKind("error");
      setMsg(
        "Google aún no está activado en Supabase. Usa email mientras tanto. " +
          (e instanceof Error ? e.message : ""),
      );
    }
  };

  return (
    <div className="max-w-[440px] mx-auto rounded-3xl border-4 border-[#1a1523] bg-white p-6 block-shadow">
      <div className="flex items-center gap-3">
        <Bloqui size={52} />
        <div>
          <h1 className="font-display text-3xl font-extrabold">
            Entra a BLOCKWEB
          </h1>
          <p className="flex items-center gap-1.5 text-sm opacity-70">
            Login obligatorio para guardar tu avance en la nube
            <Icon name="cloud" size={15} />
          </p>
        </div>
      </div>
      <button
        onClick={google}
        disabled={busy}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-4 border-[#1a1523] font-extrabold py-3 disabled:opacity-50"
      >
        <Icon name="globe" size={18} />
        Continuar con Google
      </button>
      <div className="my-3 text-center text-xs font-bold opacity-60">
        — o con email —
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        {(["login", "registro"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-sm font-bold ${mode === m ? "bg-[#1a1523] text-white" : ""}`}
          >
            <Icon name={m === "login" ? "key" : "pencil"} size={15} />
            {m === "login" ? "Entrar" : "Registrarme"}
          </button>
        ))}
      </div>
      {mode === "registro" && (
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre / nick"
          className="w-full rounded-xl border-2 px-3 py-2 text-sm font-bold mb-2 bg-transparent"
        />
      )}
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@mail.com"
        type="email"
        className="w-full rounded-xl border-2 px-3 py-2 text-sm font-bold mb-2 bg-transparent"
      />
      <input
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder="Contraseña (6+ caracteres)"
        type="password"
        className="w-full rounded-xl border-2 px-3 py-2 text-sm font-bold mb-2 bg-transparent"
      />
      <button
        onClick={submitEmail}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B35] text-white font-extrabold py-3 disabled:opacity-50"
      >
        {busy ? (
          <Icon name="hourglass" size={18} />
        ) : mode === "login" ? (
          <>
            Entrar
            <Icon name="rocket" size={16} />
          </>
        ) : (
          <>
            Crear cuenta
            <Icon name="party" size={16} />
          </>
        )}
      </button>
      {msg && (
        <p className="mt-2 flex items-start gap-1.5 text-sm font-bold">
          <Icon
            name={msgKind === "error" ? "warning" : "checkCircle"}
            size={15}
            className="mt-0.5 shrink-0"
          />
          <span>{msg}</span>
        </p>
      )}
      <p className="mt-3 text-[11px] opacity-60">
        Al entrar, tu XP y lecciones de este navegador se fusionan a tu cuenta
        una sola vez.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <p className="flex items-center gap-2 font-bold">
          <Icon name="hourglass" size={16} />
          Cargando login...
        </p>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

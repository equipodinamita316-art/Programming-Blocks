"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type SessionCtx = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<SessionCtx>({ user: null, loading: true, signOut: async () => {}, refresh: async () => {} });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let live = true;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (live) { setUser(data.user); setLoading(false); }
    }).catch(() => { if (live) setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      if (live) { setUser(session?.user || null); setLoading(false); }
    });
    return () => { live = false; sub.subscription.unsubscribe(); };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await createClient().auth.signOut();
    } finally {
      setUser(null);
    }
  }, []);

  return <Ctx.Provider value={{ user, loading, signOut, refresh }}>{children}</Ctx.Provider>;
}

export function useSession() {
  return useContext(Ctx);
}

export function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
}

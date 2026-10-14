import type { Metadata } from "next";
import { Baloo_2, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { SessionProvider } from "@/lib/supabase/session";

const display = Baloo_2({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--bw-display" });
const body = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--bw-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--bw-mono" });

export const metadata: Metadata = {
  title: "BLOCKWEB — Aprende HTML, CSS y JS creando",
  description:
    "Plataforma web divertida y exigente para aprender HTML, CSS y JS construyendo lo que te gusta. Con certificado verificable.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('bw-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}

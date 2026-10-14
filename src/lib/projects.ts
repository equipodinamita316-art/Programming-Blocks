"use client";

import { supabase } from "./supabase";
import { getAssetBlob } from "./assets";
import { saveProject } from "./store";

// Publica un proyecto: si hay Supabase configurado sube assets + fila (URL compartible real).
// Si no, guarda local y avisa que el link solo abre en este dispositivo.
export async function publishProject(input: {
  slug: string;
  nombre: string;
  html: string;
  bloques?: string[];
}): Promise<{ slug: string; shared: boolean; message: string }> {
  let html = input.html;
  const assetIds = [...new Set([...html.matchAll(/data-asset="([^"]+)"/g)].map((m) => m[1]))];

  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      for (const id of assetIds) {
        const blob = await getAssetBlob(id);
        if (!blob) continue;
        const ext = (blob.type.split("/")[1] || "bin").slice(0, 8);
        const path = `${input.slug}/${id}.${ext}`;
        const up = await supabase.storage.from("assets").upload(path, blob, { upsert: true, contentType: blob.type });
        if (up.error) throw up.error;
        const pub = supabase.storage.from("assets").getPublicUrl(path);
        const url = pub.data.publicUrl;
        html = html.split(`data-asset="${id}" src=""`).join(`data-asset="${id}" src="${url}"`);
        html = html.replace(new RegExp(`src="blob:[^"]*"`, "g"), (m) => m); // conserva otros blob solo-local
        // reemplazo dirigido blob -> pública para este asset
        html = html.replace(new RegExp(`data-asset="${id}" src="blob:[^"]*"`, "g"), `data-asset="${id}" src="${url}"`);
      }
      // Si aún quedan blob: (assets sin subir), se publica igual pero se avisa
      const hasBlob = html.includes("src=\"blob:");
      const { error } = await supabase.from("proyectos_bloques").insert({
        user_id: user?.id || null,
        nombre: input.nombre,
        html_generado: html,
        bloques_json: input.bloques || [],
        publicado: true,
        slug_publico: input.slug,
      });
      if (error) throw error;
      return {
        slug: input.slug,
        shared: !hasBlob,
        message: hasBlob
          ? "Publicado en la nube, pero alguna imagen solo vive en este navegador (súbela de nuevo)."
          : "🌐 Publicado con URL compartible real.",
      };
    } catch (e) {
      console.warn("[BLOCKWEB] publish nube falló, fallback local:", e);
    }
  }

  saveProject({ slug: input.slug, nombre: input.nombre, html, fecha: new Date().toISOString() });
  return { slug: input.slug, shared: false, message: "💾 Guardado en este dispositivo. El link /p/... solo abre aquí hasta conectar Supabase." };
}

export async function fetchSharedProject(slug: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("proyectos_bloques").select("html_generado").eq("slug_publico", slug).eq("publicado", true).limit(1).single();
    if (error) return null;
    return (data as { html_generado: string } | null)?.html_generado || null;
  } catch {
    return null;
  }
}

export async function verifyCertRemote(codigo: string): Promise<{ nombre: string; nota: number; fecha: string; codigo: string } | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc("verify_cert", { p_codigo: codigo });
    if (error) return null;
    const row = (data as unknown[])?.[0] as { nombre: string; nota: number; fecha: string; codigo: string } | undefined;
    return row || null;
  } catch {
    return null;
  }
}

"use client";

// Archivos del jugador: IndexedDB (blobs) con fallback a memoria.
// Hoy local; mañana el src se resuelve a Supabase Storage sin cambiar bloques.

export type Asset = { id: string; lessonId: string; name: string; kind: "image" | "video"; mime: string; size: number; createdAt: number };

const DB = "bw-assets-db";
const STORE = "assets";
type BwUrls = { __bw_urls?: Record<string, string> };
const memUrl = new Map<string, string>();
const memBlob = new Map<string, Blob>();

function openDb(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) return rej(new Error("no-idb"));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export async function saveAssetFile(lessonId: string, file: File): Promise<{ asset: Asset; url: string }> {
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) throw new Error("Solo imágenes o videos 📁");
  if (file.size > 5 * 1024 * 1024) throw new Error("Máximo 5MB por archivo");
  const kind = file.type.startsWith("image/") ? "image" : "video";
  const asset: Asset = { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, lessonId, name: file.name.slice(0, 60), kind, mime: file.type, size: file.size, createdAt: Date.now() };
  try {
    const db = await openDb();
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ ...asset, blob: file });
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch {
    memBlob.set(asset.id, file);
  }
  const url = URL.createObjectURL(file);
  memUrl.set(asset.id, url);
  try {
    const meta = JSON.parse(localStorage.getItem("bw-assets-meta") || "[]");
    localStorage.setItem("bw-assets-meta", JSON.stringify([...meta, asset].slice(-60)));
    window.dispatchEvent(new Event("bw-assets"));
  } catch {}
  return { asset, url };
}

export async function listAssets(lessonId?: string): Promise<{ asset: Asset; url: string }[]> {
  let metas: Asset[] = [];
  try {
    metas = JSON.parse(localStorage.getItem("bw-assets-meta") || "[]");
  } catch { metas = []; }
  if (lessonId) metas = metas.filter((m) => m.lessonId === lessonId || m.lessonId === "global");
  const out: { asset: Asset; url: string }[] = [];
  try {
    const db = await openDb();
    for (const m of metas) {
      if (memUrl.has(m.id)) { out.push({ asset: m, url: memUrl.get(m.id)! }); continue; }
      const blob: Blob | undefined = await new Promise((res) => {
        try {
          const tx = db.transaction(STORE, "readonly");
          const rq = tx.objectStore(STORE).get(m.id);
          rq.onsuccess = () => res(rq.result?.blob);
          rq.onerror = () => res(undefined);
        } catch { res(undefined); }
      });
      if (blob) {
        const url = URL.createObjectURL(blob);
        memUrl.set(m.id, url);
        out.push({ asset: m, url });
      }
    }
  } catch {
    for (const m of metas) {
      const b = memBlob.get(m.id);
      if (b && !memUrl.has(m.id)) memUrl.set(m.id, URL.createObjectURL(b));
      if (memUrl.has(m.id)) out.push({ asset: m, url: memUrl.get(m.id)! });
    }
  }
  return out.reverse();
}

export async function deleteAsset(id: string) {
  try {
    const db = await openDb();
    await new Promise<void>((res) => {
      try {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = () => res();
        tx.onerror = () => res();
      } catch { res(); }
    });
  } catch {}
  try {
    const meta = JSON.parse(localStorage.getItem("bw-assets-meta") || "[]").filter((m: Asset) => m.id !== id);
    localStorage.setItem("bw-assets-meta", JSON.stringify(meta));
    const u = memUrl.get(id);
    if (u) URL.revokeObjectURL(u);
    memUrl.delete(id);
    memBlob.delete(id);
    window.dispatchEvent(new Event("bw-assets"));
  } catch {}
}

export async function getAssetBlob(id: string): Promise<Blob | undefined> {
  if (memBlob.has(id)) return memBlob.get(id);
  try {
    const db = await openDb();
    const blob: Blob | undefined = await new Promise((res) => {
      try {
        const tx = db.transaction(STORE, "readonly");
        const rq = tx.objectStore(STORE).get(id);
        rq.onsuccess = () => res(rq.result?.blob);
        rq.onerror = () => res(undefined);
      } catch { res(undefined); }
    });
    return blob;
  } catch { return undefined; }
}

// Para generadores: resuelve assetId -> url (o "" si falta)
export function resolveAssetUrl(id: string): string {
  return memUrl.get(id) || "";
}

export function cachedUrls(): Record<string, string> {
  const o: Record<string, string> = {};
  memUrl.forEach((v, k) => { o[k] = v; });
  return o;
}

// --- Data URLs: cargan en iframes sandbox opacos (los blob: están prohibidos ahí) ---
const memData = new Map<string, string>();

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result || ""));
    fr.onerror = () => rej(fr.error);
    fr.readAsDataURL(blob);
  });
}

// Lectura síncrona (para generadores): data URL si ya se convirtió, si no blob, si no "".
export function peekAssetUrl(id: string): string {
  return memData.get(id) || memUrl.get(id) || "";
}

export async function getAssetDataUrl(id: string): Promise<string> {
  const hit = memData.get(id);
  if (hit) return hit;
  const blob = await getAssetBlob(id);
  if (!blob) return "";
  try {
    const data = await blobToDataUrl(blob);
    if (data) memData.set(id, data);
    return data;
  } catch {
    return "";
  }
}

// Convierte todos los assets conocidos a data URLs y publica el mapa global.
// Llamar en background tras listar/subir; avisa con evento para re-emitir previews.
export async function primeDataUrls(): Promise<Record<string, string>> {
  let metas: Asset[] = [];
  try {
    metas = JSON.parse(localStorage.getItem("bw-assets-meta") || "[]");
  } catch { metas = []; }
  const urls: Record<string, string> = {};
  await Promise.all(metas.map(async (m) => {
    const data = await getAssetDataUrl(m.id);
    if (data) urls[m.id] = data;
    else if (memUrl.has(m.id)) urls[m.id] = memUrl.get(m.id)!;
  }));
  try {
    (globalThis as unknown as BwUrls).__bw_urls = urls;
    window.dispatchEvent(new Event("bw-assets-ready"));
  } catch {}
  return urls;
}

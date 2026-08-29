"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconUpload } from "@/components/Icons";

type SignParams = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

const RECOMMENDED_SIZE = "512×512 (1:1)";

export function GameCoverUploader({
  gameId,
  gameName,
  signParams,
}: {
  gameId: string;
  gameName: string;
  signParams: SignParams;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    // Validate size hint (warn only)
    const dims = await getImageDimensions(file);
    if (dims && (dims.width !== dims.height || dims.width < 256)) {
      if (!confirm(
        `Ukuran gambar ${dims.width}×${dims.height} bukan 1:1 square (rekomendasi ${RECOMMENDED_SIZE}). Lanjut?`
      )) {
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", signParams.apiKey);
      fd.append("timestamp", String(signParams.timestamp));
      fd.append("signature", signParams.signature);
      fd.append("folder", signParams.folder);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${signParams.cloudName}/image/upload`,
        { method: "POST", body: fd }
      );
      if (!res.ok) {
        const t = await res.text();
        let msg = t;
        try {
          const parsed = JSON.parse(t);
          msg = parsed?.error?.message ?? t;
        } catch {}
        if (/cloud_name.*disabled/i.test(msg)) {
          throw new Error(
            `Cloudinary cloud "${signParams.cloudName}" disabled. Aktifkan dulu di dashboard Cloudinary.`
          );
        }
        throw new Error(`Cloudinary: ${msg}`);
      }
      const json = await res.json();

      const saveRes = await fetch(`/api/admin/games/${gameId}/cover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId: json.public_id,
          url: json.secure_url,
        }),
      });
      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error ?? "Gagal simpan");
      }

      if (inputRef.current) inputRef.current.value = "";
      startTransition(() => router.refresh());
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 opacity-0 transition hover:bg-black/40 hover:opacity-100">
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-black hover:bg-white disabled:opacity-50"
        title={`Upload cover (rekomendasi ${RECOMMENDED_SIZE})`}
      >
        <IconUpload />
        {uploading ? "Uploading…" : "Upload Cover"}
      </button>
      <div className="mt-1 text-[10px] text-white/70">
        Cover: {RECOMMENDED_SIZE}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onFile}
        disabled={uploading}
      />
      {error && (
        <div className="absolute bottom-2 left-2 right-2 rounded bg-red-500/90 px-2 py-1 text-[10px] text-white">
          {error}
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-2 py-0.5 text-center text-[9px] text-white/50 opacity-0 group-hover:opacity-100">
        {gameName}
      </div>
    </div>
  );
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}
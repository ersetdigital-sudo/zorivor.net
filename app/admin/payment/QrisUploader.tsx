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

export function QrisUploader({ signParams }: { signParams: SignParams }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("QRIS Utama");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signParams.apiKey);
      formData.append("timestamp", String(signParams.timestamp));
      formData.append("signature", signParams.signature);
      formData.append("folder", signParams.folder);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${signParams.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!res.ok) {
        const txt = await res.text();
        let msg = txt;
        try {
          const parsed = JSON.parse(txt);
          msg = parsed?.error?.message ?? txt;
        } catch {}
        if (/cloud_name.*disabled/i.test(msg)) {
          throw new Error(
            `Cloudinary cloud "${signParams.cloudName}" sedang disabled di sisi Cloudinary. Aktifkan dulu di dashboard Cloudinary → Settings → re-enable cloud, lalu coba lagi.`
          );
        }
        throw new Error(`Cloudinary: ${msg}`);
      }
      const json = await res.json();

      const saveRes = await fetch("/api/admin/qris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          publicId: json.public_id,
          url: json.secure_url,
          width: json.width,
          height: json.height,
          bytes: json.bytes,
        }),
      });
      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error ?? "Failed to save");
      }

      setLabel("QRIS Utama");
      if (fileInput.current) fileInput.current.value = "";
      startTransition(() => router.refresh());
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex-1 min-w-[180px]">
          <span className="mb-1 block text-xs text-white/50">Label</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="QRIS Utama"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
          />
        </label>

        <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
          <IconUpload />
          <span>{uploading ? "Uploading…" : "Pilih Gambar"}</span>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <p className="text-xs text-white/40">
        Cloud:{" "}
        <code className="rounded bg-black/30 px-1">
          {signParams.cloudName || "(not configured)"}
        </code>
        . Format: PNG/JPG/WebP, max ~10 MB.
      </p>
    </div>
  );
}
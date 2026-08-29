"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type QrisItem = {
  id: string;
  label: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  is_active: boolean;
  created_at: string;
};

export function QrisGallery({ items }: { items: QrisItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function toggle(id: string, is_active: boolean) {
    await fetch(`/api/admin/qris/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active }),
    });
    startTransition(() => router.refresh());
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
        Belum ada QRIS diupload.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((q) => (
        <div
          key={q.id}
          className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
        >
          <div className="relative aspect-square w-full bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={q.cloudinary_url}
              alt={q.label}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium">{q.label}</div>
                <div className="font-mono text-[10px] text-white/40">
                  {q.cloudinary_public_id}
                </div>
                <div className="text-[10px] text-white/40">
                  {new Date(q.created_at).toLocaleString("id-ID")}
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  q.is_active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-white/5 text-white/50"
                }`}
              >
                {q.is_active ? "Aktif" : "Off"}
              </span>
            </div>
            <button
              onClick={() => toggle(q.id, !q.is_active)}
              disabled={pending}
              className="mt-2 w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10 disabled:opacity-50"
            >
              {q.is_active ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
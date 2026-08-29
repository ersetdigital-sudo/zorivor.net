"use client";

import { useState, useTransition } from "react";
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

// 240x240 px preview window (per requirements)
const PREVIEW_SIZE = 240;

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
    return <EmptyState />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((q) => (
        <QrisCard
          key={q.id}
          item={q}
          pending={pending}
          onToggle={() => toggle(q.id, !q.is_active)}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div
          className="mx-auto grid place-items-center rounded-xl border border-dashed border-white/15 bg-white/[0.04]"
          style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE, maxWidth: "100%" }}
        >
          <div className="text-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="mx-auto text-white/30"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
            </svg>
            <div className="mt-2 text-xs text-white/50">Belum ada QRIS</div>
          </div>
        </div>
        <div className="mt-3 px-1 text-xs text-white/50">
          Upload gambar QRIS di atas untuk mulai.
        </div>
      </div>
    </div>
  );
}

function QrisCard({
  item,
  pending,
  onToggle,
}: {
  item: QrisItem;
  pending: boolean;
  onToggle: () => void;
}) {
  const [broken, setBroken] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex justify-center">
        <div
          className="relative overflow-hidden rounded-xl border border-white/10 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05)]"
          style={{
            width: PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            maxWidth: "100%",
            aspectRatio: "1 / 1",
          }}
        >
          {broken ? (
            <div className="flex h-full w-full items-center justify-center bg-white text-zinc-400">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 3l18 18" strokeLinecap="round" />
              </svg>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.cloudinary_url}
              alt={item.label}
              onError={() => setBroken(true)}
              className="h-full w-full object-contain p-2"
            />
          )}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">
              {item.label}
            </div>
            <div className="truncate font-mono text-[10px] text-white/40">
              {item.cloudinary_public_id}
            </div>
            <div className="text-[10px] text-white/40">
              {new Date(item.created_at).toLocaleString("id-ID")}
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              item.is_active
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-white/5 text-white/50"
            }`}
          >
            {item.is_active ? "Aktif" : "Off"}
          </span>
        </div>

        <button
          onClick={onToggle}
          disabled={pending}
          className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 transition hover:bg-white/10 disabled:opacity-50"
        >
          {item.is_active ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </div>
    </div>
  );
}
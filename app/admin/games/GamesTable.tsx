"use client";

import { useState, useTransition } from "react";
import { humaniseError } from "@/lib/errors";
import { useRouter } from "next/navigation";
import { IconPlus, IconTrash } from "@/components/Icons";
import { GameCoverUploader } from "./GameCoverUploader";
import { useConfirm } from "@/components/ConfirmModal";

type Game = {
  id: string;
  slug: string;
  name: string;
  publisher: string | null;
  category: string;
  cover_url: string | null;
  is_active: boolean;
  sort_order: number;
};

type SignParams = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

export function GamesTable({
  games,
  signParams,
}: {
  games: Game[];
  signParams: SignParams | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const { ask, ConfirmNode } = useConfirm();

  async function toggle(id: string, is_active: boolean) {
    await fetch(`/api/admin/games/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active }),
    });
    startTransition(() => router.refresh());
  }

  async function remove(id: string, name: string) {
    ask({
      title: "Hapus Game?",
      itemName: name,
      description:
        "Produk yang terkait game ini akan kehilangan referensinya. Game akan hilang dari katalog landing page dan tidak bisa dipilih di halaman top-up. Aksi ini tidak bisa dibatalkan.",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/games/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(humaniseError(e.error, "Gagal menghapus game"));
        }
        startTransition(() => router.refresh());
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
        >
          <IconPlus /> Tambah Game
        </button>
      </div>

      {showAdd && (
        <AddGameForm
          onDone={() => {
            setShowAdd(false);
            startTransition(() => router.refresh());
          }}
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {games.map((g) => (
          <div
            key={g.id}
            className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition hover:border-white/20"
          >
            <div className="relative w-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20" style={{ aspectRatio: "3/4" }}>
              {g.cover_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={g.cover_url}
                  alt={g.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl text-white/30">
                  🎮
                </div>
              )}
              {signParams && (
                <GameCoverUploader
                  gameId={g.id}
                  gameName={g.name}
                  signParams={signParams}
                />
              )}
            </div>
            <div className="p-2.5">
              <div className="flex items-start justify-between gap-1.5">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold">{g.name}</div>
                  <div className="truncate text-[11px] text-white/50">
                    {g.publisher ?? "-"} · {g.category}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                    g.is_active
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-white/5 text-white/50"
                  }`}
                >
                  {g.is_active ? "Aktif" : "Off"}
                </span>
              </div>
              <div className="mt-1.5 flex gap-1">
                <button
                  onClick={() => toggle(g.id, !g.is_active)}
                  disabled={pending}
                  className="flex-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-1 text-[11px] text-white/80 hover:bg-white/10 disabled:opacity-50"
                >
                  {g.is_active ? "Off" : "On"}
                </button>
                <a
                  href={`/admin/games/${g.id}`}
                  className="flex-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-1 text-center text-[11px] text-white/80 hover:bg-white/10"
                >
                  Produk
                </a>
                <button
                  onClick={() => remove(g.id, g.name)}
                  disabled={pending}
                  className="rounded-md bg-red-500/10 px-1.5 py-1 text-[11px] text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                >
                  <IconTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/50">
          Belum ada game
        </div>
      )}

      <ConfirmNode />
    </div>
  );
}

function AddGameForm({ onDone }: { onDone: () => void }) {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [publisher, setPublisher] = useState("");
  const [category, setCategory] = useState("populer");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        name: name.trim(),
        publisher: publisher.trim() || null,
        category,
        description: description.trim() || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Gagal");
      return;
    }
    onDone();
  }

  return (
    <form
      onSubmit={save}
      className="space-y-3 rounded-2xl border border-violet-400/30 bg-violet-500/5 p-5"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nama Game">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            placeholder="Mobile Legends"
          />
        </Field>
        <Field label="Slug (auto)">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            placeholder="mobile-legends"
          />
        </Field>
        <Field label="Publisher">
          <input
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            placeholder="Moonton"
          />
        </Field>
        <Field label="Kategori">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="populer">Populer</option>
            <option value="topup">Top Up</option>
            <option value="voucher">Voucher</option>
            <option value="hiburan">Hiburan</option>
            <option value="steam">Steam</option>
          </select>
        </Field>
        <Field label="Deskripsi (opsional)">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            placeholder="Top up ML harga termurah"
          />
        </Field>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <p className="text-xs text-white/50">
        Cover image bisa di-upload setelah game dibuat (klik tombol "Produk" → upload di header).
      </p>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-50"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}
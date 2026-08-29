"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconTrash, IconUpload } from "@/components/Icons";

type Game = {
  id: string;
  slug: string;
  name: string;
};

type Product = {
  id: string;
  slug: string;
  denomination: string;
  category: string;
  price_idr: number;
  base_price_idr: number | null;
  cashback_pct: number;
  stock: number;
  is_active: boolean;
  sort_order: number;
  icon_url: string | null;
};

const ICON_RECOMMENDED = "256×256 (1:1, transparent bg ideal)";

export function GameProductsSection({
  game,
  products,
  cloudinaryError,
}: {
  game: Game;
  products: Product[];
  cloudinaryError: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);

  async function remove(id: string, label: string) {
    if (!confirm(`Hapus "${label}"?`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Produk</h2>
          <p className="text-xs text-white/60">
            Icon: <b>{ICON_RECOMMENDED}</b>, max 500 KB, PNG.
          </p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
        >
          <IconPlus /> Tambah Produk
        </button>
      </div>

      {showAdd && (
        <AddProductForm
          gameId={game.id}
          gameName={game.name}
          gameSlug={game.slug}
          onDone={() => {
            setShowAdd(false);
            startTransition(() => router.refresh());
          }}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase text-white/50">
            <tr>
              <th className="px-3 py-2">Icon</th>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Harga Jual</th>
              <th className="px-3 py-2">Cashback</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                pending={pending}
                onRefresh={() => startTransition(() => router.refresh())}
                onRemove={() => remove(p.id, p.denomination)}
              />
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-white/50">
                  Belum ada produk
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {cloudinaryError && (
        <p className="text-xs text-amber-300">
          Upload icon nonaktif karena Cloudinary belum dikonfigurasi.
        </p>
      )}
    </div>
  );
}

function ProductRow({
  product,
  pending,
  onRefresh,
  onRemove,
}: {
  product: Product;
  pending: boolean;
  onRefresh: () => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(product);

  async function save() {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        denomination: draft.denomination,
        category: draft.category,
        price_idr: Number(draft.price_idr),
        base_price_idr: draft.base_price_idr ? Number(draft.base_price_idr) : null,
        cashback_pct: Number(draft.cashback_pct),
        stock: Number(draft.stock),
        is_active: draft.is_active,
        sort_order: Number(draft.sort_order),
      }),
    });
    if (res.ok) {
      setEditing(false);
      onRefresh();
    }
  }

  if (editing) {
    return (
      <tr className="border-t border-white/5 bg-violet-500/5">
        <td colSpan={2} className="px-3 py-3">
          <input
            value={draft.denomination}
            onChange={(e) => setDraft({ ...draft, denomination: e.target.value })}
            className="w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
          />
        </td>
        <td className="px-3 py-3">
          <input
            type="number"
            value={draft.price_idr}
            onChange={(e) => setDraft({ ...draft, price_idr: Number(e.target.value) })}
            className="w-24 rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
          />
        </td>
        <td className="px-3 py-3">
          <input
            type="number"
            value={draft.cashback_pct}
            onChange={(e) => setDraft({ ...draft, cashback_pct: Number(e.target.value) })}
            className="w-14 rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
          />
        </td>
        <td className="px-3 py-3">
          <input
            type="number"
            value={draft.stock}
            onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
            className="w-16 rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
          />
        </td>
        <td className="px-3 py-3">
          <select
            value={draft.is_active ? "1" : "0"}
            onChange={(e) => setDraft({ ...draft, is_active: e.target.value === "1" })}
            className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
          >
            <option value="1">Aktif</option>
            <option value="0">Off</option>
          </select>
        </td>
        <td className="px-3 py-3">
          <div className="flex gap-1">
            <button
              onClick={save}
              className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-500/30"
            >
              Simpan
            </button>
            <button
              onClick={() => {
                setDraft(product);
                setEditing(false);
              }}
              className="rounded bg-white/5 px-2 py-1 text-xs text-white/70 hover:bg-white/10"
            >
              Batal
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-white/5">
      <td className="px-3 py-3">
        <div className="h-9 w-9 overflow-hidden rounded bg-white/5">
          {product.icon_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={product.icon_url} alt="" className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
              ◇
            </div>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="font-medium">{product.denomination}</div>
        <div className="text-xs text-white/60">{product.category}</div>
      </td>
      <td className="px-3 py-3">
        <div className="font-medium">
          Rp {product.price_idr.toLocaleString("id-ID")}
        </div>
        {product.base_price_idr != null && (
          <div className="text-[10px] text-white/50 line-through">
            Rp {product.base_price_idr.toLocaleString("id-ID")}
          </div>
        )}
      </td>
      <td className="px-3 py-3 text-xs">{product.cashback_pct}%</td>
      <td className="px-3 py-3 text-xs">{product.stock}</td>
      <td className="px-3 py-3">
        {product.is_active ? (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
            Aktif
          </span>
        ) : (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/50">
            Off
          </span>
        )}
      </td>
      <td className="px-3 py-3">
        <div className="flex gap-1">
          <button
            onClick={() => setEditing(true)}
            className="rounded bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
          >
            Edit
          </button>
          <button
            onClick={onRemove}
            disabled={pending}
            className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
          >
            <IconTrash />
          </button>
        </div>
      </td>
    </tr>
  );
}

function AddProductForm({
  gameId,
  gameName,
  gameSlug,
  onDone,
}: {
  gameId: string;
  gameName: string;
  gameSlug: string;
  onDone: () => void;
}) {
  const [denomination, setDenomination] = useState("");
  const [category, setCategory] = useState("Diamond");
  const [price, setPrice] = useState(10000);
  const [basePrice, setBasePrice] = useState(11000);
  const [cashback, setCashback] = useState(5);
  const [stock, setStock] = useState(999);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const slug =
      `${gameSlug}-${denomination}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      `-${Date.now().toString(36)}`;
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        game_id: gameId,
        game: gameName,
        category,
        denomination: denomination.trim(),
        price_idr: price,
        base_price_idr: basePrice || null,
        cashback_pct: cashback,
        stock,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Gagal");
      return;
    }
    setDenomination("");
    setPrice(10000);
    onDone();
  }

  return (
    <form
      onSubmit={save}
      className="space-y-3 rounded-2xl border border-violet-400/30 bg-violet-500/5 p-5"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wide text-white/50">
            Denominasi
          </span>
          <input
            value={denomination}
            onChange={(e) => setDenomination(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            placeholder="100 Diamond"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-white/50">
            Kategori
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option>Diamond</option>
            <option>UC</option>
            <option>Genesis</option>
            <option>Points</option>
            <option>Chip</option>
            <option>Paket</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-white/50">
            Harga Jual
          </span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-white/50">
            Harga Coret (opsional)
          </span>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-white/50">
            Cashback %
          </span>
          <input
            type="number"
            value={cashback}
            onChange={(e) => setCashback(Number(e.target.value))}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-white/50">
            Stock
          </span>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <p className="text-xs text-white/50">
        Icon (PNG, {ICON_RECOMMENDED}) bisa di-upload setelah produk dibuat.
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
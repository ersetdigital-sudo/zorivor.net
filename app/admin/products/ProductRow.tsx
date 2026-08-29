"use client";

import { useState, useTransition } from "react";
import { deleteProduct, upsertProduct } from "../actions";
import type { Product } from "@/lib/types";

export function ProductRow({ product }: { product: Product }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState(product);

  function save() {
    startTransition(async () => {
      await upsertProduct({
        id: product.id,
        game: draft.game,
        category: draft.category,
        denomination: draft.denomination,
        price_idr: Number(draft.price_idr),
        base_price_idr:
          draft.base_price_idr === null || isNaN(Number(draft.base_price_idr))
            ? null
            : Number(draft.base_price_idr),
        cashback_pct: Number(draft.cashback_pct),
        stock: Number(draft.stock),
        is_active: draft.is_active,
        sort_order: Number(draft.sort_order),
      });
      setEditing(false);
    });
  }

  function remove() {
    if (!confirm(`Hapus ${product.denomination}?`)) return;
    startTransition(async () => {
      await deleteProduct(product.id);
    });
  }

  if (editing) {
    return (
      <tr className="border-t border-white/5 bg-violet-500/5">
        <td className="px-3 py-3">
          <input
            value={draft.game}
            onChange={(e) => setDraft({ ...draft, game: e.target.value })}
            className="w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
            placeholder="Game"
          />
          <input
            value={draft.denomination}
            onChange={(e) =>
              setDraft({ ...draft, denomination: e.target.value })
            }
            className="mt-1 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
            placeholder="Denomination"
          />
        </td>
        <td className="px-3 py-3">
          <input
            type="number"
            value={draft.price_idr}
            onChange={(e) =>
              setDraft({ ...draft, price_idr: Number(e.target.value) })
            }
            className="w-28 rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
          />
          <input
            type="number"
            value={draft.base_price_idr ?? 0}
            placeholder="base"
            onChange={(e) =>
              setDraft({
                ...draft,
                base_price_idr: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
            className="mt-1 w-28 rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
          />
        </td>
        <td className="px-3 py-3">
          <input
            type="number"
            value={draft.cashback_pct}
            onChange={(e) =>
              setDraft({ ...draft, cashback_pct: Number(e.target.value) })
            }
            className="w-16 rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
          />
        </td>
        <td className="px-3 py-3">
          <input
            type="number"
            value={draft.stock}
            onChange={(e) =>
              setDraft({ ...draft, stock: Number(e.target.value) })
            }
            className="w-16 rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
          />
        </td>
        <td className="px-3 py-3">
          <select
            value={draft.is_active ? "1" : "0"}
            onChange={(e) =>
              setDraft({ ...draft, is_active: e.target.value === "1" })
            }
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
              disabled={pending}
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
    <tr className="border-t border-white/5 hover:bg-white/[0.02]">
      <td className="px-3 py-3">
        <div className="font-medium">{product.game}</div>
        <div className="text-xs text-white/60">
          {product.category} · {product.denomination}
        </div>
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
            onClick={remove}
            disabled={pending}
            className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-300 hover:bg-red-500/20"
          >
            Hapus
          </button>
        </div>
      </td>
    </tr>
  );
}
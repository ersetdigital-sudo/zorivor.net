"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "../actions";
import { useConfirm } from "@/components/ConfirmModal";
import { Toast } from "@/components/Toast";
import { humaniseError } from "@/lib/errors";
import type { Order, OrderStatus } from "@/lib/types";

const NEXT_STATUS: Record<string, OrderStatus[]> = {
  pending: ["paid", "failed"],
  paid: ["processing", "failed", "refunded"],
  processing: ["success", "failed"],
  success: [],
  failed: ["refunded"],
  refunded: [],
};

export function OrderStatusActions({ order }: { order: Order }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(order.notes ?? "");
  const [deleting, setDeleting] = useState(false);
  const [pending, startTransition] = useTransition();
  const { ask, ConfirmNode } = useConfirm();

  const options = NEXT_STATUS[order.status] ?? [];

  function change(next: OrderStatus) {
    startTransition(async () => {
      try {
        await updateOrderStatus(order.id, next, notes);
        Toast.success(`Status diubah ke ${next}`);
        setOpen(false);
      } catch (e: any) {
        Toast.error(humaniseError(e?.message));
      }
    });
  }

  function askDelete() {
    if (deleting) return; // belt-and-braces guard against rapid double-click
    ask({
      title: "Hapus Pesanan?",
      itemName: order.invoice,
      description:
        "Pesanan akan dihapus permanen dari database. Invoice ini tidak akan bisa ditemukan lagi oleh customer. Aksi ini tidak bisa dibatalkan — biasanya hanya untuk order test / duplikat / salah input. Pertimbangkan ubah status ke 'refunded' untuk audit trail.",
      confirmLabel: "Hapus Permanen",
      onConfirm: async () => {
        setDeleting(true);
        try {
          const res = await fetch(`/api/admin/orders/${order.id}`, {
            method: "DELETE",
          });
          // 404 = already gone (race / double click) — treat as success
          if (res.ok) {
            Toast.success("Pesanan dihapus");
          } else {
            const data = await res.json().catch(() => ({}));
            if (res.status === 404) {
              // Already deleted — just refresh the list and treat as ok
              Toast.info("Pesanan sudah dihapus");
            } else {
              Toast.error(humaniseError(data?.error, "Gagal menghapus pesanan"));
            }
          }
          startTransition(() => router.refresh());
        } catch (e: any) {
          Toast.error(humaniseError(e?.message, "Gagal menghapus pesanan"));
        } finally {
          setDeleting(false);
        }
      },
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {options.map((s) => (
          <button
            key={s}
            disabled={pending}
            onClick={() => change(s)}
            className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs capitalize text-white/80 transition hover:bg-white/[0.08] disabled:opacity-50"
          >
            → {s}
          </button>
        ))}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white/60 hover:bg-white/[0.08]"
        >
          notes
        </button>
        <button
          onClick={askDelete}
          disabled={deleting || pending}
          title="Hapus pesanan permanen"
          className="ml-auto rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "Menghapus…" : "Hapus"}
        </button>
      </div>
      {open && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Catatan internal…"
          className="w-full rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs text-white outline-none focus:border-violet-400/60"
        />
      )}

      <ConfirmNode />
    </div>
  );
}
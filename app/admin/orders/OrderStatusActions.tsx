"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "../actions";
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
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(order.notes ?? "");
  const [pending, startTransition] = useTransition();

  const options = NEXT_STATUS[order.status] ?? [];

  function change(next: OrderStatus) {
    startTransition(async () => {
      await updateOrderStatus(order.id, next, notes);
      setOpen(false);
    });
  }

  if (options.length === 0) {
    return <span className="text-xs text-white/40">—</span>;
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
    </div>
  );
}
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OrderStatusActions } from "./OrderStatusActions";
import type { Order, OrderStatus } from "@/lib/types";

export function OrdersTable({
  initialOrders,
  status: _status,
  q: _q,
}: {
  initialOrders: Order[];
  status: OrderStatus | "all";
  q: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Track order IDs we've optimistically removed (or updated) but for
  // which the server snapshot hasn't caught up yet. We use this to
  // prevent the useEffect below from clobbering the local state with
  // a stale `initialOrders` that still contains the deleted row (the
  // cause of "deleted rows come back" bug on rapid sequential
  // deletes).
  const inflight = useRef<Set<string>>(new Set());
  // Skip the first sync — the initial prop IS the source of truth.
  const firstSync = useRef(true);

  useEffect(() => {
    if (firstSync.current) {
      firstSync.current = false;
      return;
    }
    // On subsequent renders, strip any order that the user just
    // deleted locally (server snapshot may not have caught up yet).
    setOrders((prev) => {
      if (inflight.current.size === 0) return initialOrders;
      return initialOrders.filter((o) => !inflight.current.has(o.id));
    });
  }, [initialOrders]);

  function handleDeleted(deletedId: string) {
    inflight.current.add(deletedId);
    // Functional update — uses latest state, not stale closure.
    setOrders((prev) => prev.filter((o) => o.id !== deletedId));
    // Sync with server in background. Don't clear inflight until
    // server returns a snapshot without this id.
    startTransition(() => router.refresh());
    // Failsafe: clear after 8s in case server never returns the
    // updated snapshot.
    setTimeout(() => inflight.current.delete(deletedId), 8_000);
  }

  function handleUpdated(updated: Order) {
    inflight.current.delete(updated.id);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    startTransition(() => router.refresh());
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-white/50">
        Tidak ada pesanan dengan filter ini.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-left text-xs uppercase text-white/50">
          <tr>
            <th className="px-3 py-2">Invoice</th>
            <th className="px-3 py-2">Game / Item</th>
            <th className="px-3 py-2">User ID</th>
            <th className="px-3 py-2">Pembayaran</th>
            <th className="px-3 py-2">Amount</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <OrderRow
              key={o.id}
              order={o}
              onDeleted={handleDeleted}
              onUpdated={handleUpdated}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderRow({
  order,
  onDeleted,
  onUpdated,
}: {
  order: Order;
  onDeleted: (deletedId: string) => void;
  onUpdated: (updated: Order) => void;
}) {
  return (
    <tr className="border-t border-white/5 align-top hover:bg-white/[0.02]">
      <td className="px-3 py-3">
        <div className="font-mono text-xs">{order.invoice}</div>
        <div className="text-[10px] text-white/40">
          {new Date(order.created_at).toLocaleString("id-ID")}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="text-white">{order.game}</div>
        <div className="text-xs text-white/60">{order.denomination}</div>
      </td>
      <td className="px-3 py-3">
        <div className="font-mono text-xs">{order.game_user_id}</div>
        {order.whatsapp && (
          <div className="text-[10px] text-white/50">WA: {order.whatsapp}</div>
        )}
      </td>
      <td className="px-3 py-3 text-xs">{order.payment_method ?? "-"}</td>
      <td className="px-3 py-3">
        <div className="font-medium">
          Rp {order.amount_idr.toLocaleString("id-ID")}
        </div>
        {order.cashback_idr > 0 && (
          <div className="text-[10px] text-emerald-300">
            cashback Rp {order.cashback_idr.toLocaleString("id-ID")}
          </div>
        )}
      </td>
      <td className="px-3 py-3">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-3 py-3">
        <OrderStatusActions
          order={order}
          onDeleted={onDeleted}
          onUpdated={onUpdated}
        />
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    paid: "bg-sky-500/15 text-sky-300 border-sky-400/30",
    processing: "bg-violet-500/15 text-violet-300 border-violet-400/30",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    failed: "bg-red-500/15 text-red-300 border-red-400/30",
    refunded: "bg-zinc-500/15 text-zinc-300 border-zinc-400/30",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs capitalize ${
        map[status] ?? "border-white/10 text-white/70"
      }`}
    >
      {status}
    </span>
  );
}

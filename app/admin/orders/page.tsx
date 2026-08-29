import { createClient } from "@/lib/supabase/server";
import { OrderStatusActions } from "./OrderStatusActions";
import type { Order, OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = (params.status ?? "all") as OrderStatus | "all";
  const q = (params.q ?? "").trim();

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "id,invoice,game,denomination,game_user_id,whatsapp,payment_method,amount_idr,cashback_idr,status,created_at,notes"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status !== "all") query = query.eq("status", status);
  if (q) {
    query = query.or(
      `invoice.ilike.%${q}%,game_user_id.ilike.%${q}%,whatsapp.ilike.%${q}%`
    );
  }

  const { data: orders } = await query;

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Pesanan</h1>
          <form className="flex items-center gap-2" method="GET">
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari invoice / user id / wa"
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            />
            <input type="hidden" name="status" value={status} />
            <button className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80 hover:bg-white/[0.08]">
              Cari
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          {STATUS_FILTERS.map((f) => {
            const active = status === f.value;
            return (
              <a
                key={f.value}
                href={`?status=${f.value}${q ? `&q=${q}` : ""}`}
                className={`rounded-full border px-3 py-1.5 transition ${
                  active
                    ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
                    : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.05]"
                }`}
              >
                {f.label}
              </a>
            );
          })}
        </div>

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
              {(orders as Order[] | null)?.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-white/5 align-top hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-3">
                    <div className="font-mono text-xs">{o.invoice}</div>
                    <div className="text-[10px] text-white/40">
                      {new Date(o.created_at).toLocaleString("id-ID")}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-white">{o.game}</div>
                    <div className="text-xs text-white/60">{o.denomination}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-mono text-xs">{o.game_user_id}</div>
                    {o.whatsapp && (
                      <div className="text-[10px] text-white/50">
                        WA: {o.whatsapp}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {o.payment_method ?? "-"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium">
                      Rp {o.amount_idr.toLocaleString("id-ID")}
                    </div>
                    {o.cashback_idr > 0 && (
                      <div className="text-[10px] text-emerald-300">
                        cashback Rp {o.cashback_idr.toLocaleString("id-ID")}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-3 py-3">
                    <OrderStatusActions order={o} />
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-10 text-center text-white/50"
                  >
                    Tidak ada pesanan dengan filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
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
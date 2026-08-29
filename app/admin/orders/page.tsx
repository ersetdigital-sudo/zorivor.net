import { createClient } from "@/lib/supabase/server";
import { OrdersTable } from "./OrdersTable";
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

        <OrdersTable
          initialOrders={(orders as Order[] | null) ?? []}
          status={status}
          q={q}
        />
      </div>
    </>
  );
}
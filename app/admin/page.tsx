import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [ordersRes, productsRes, pendingRes, successRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id,invoice,game,denomination,amount_idr,cashback_idr,status,created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("products").select("id,is_active", { count: "exact" }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("amount_idr,cashback_idr")
      .eq("status", "success"),
  ]);

  const orders = ordersRes.data ?? [];
  const totalRevenue = (successRes.data ?? []).reduce(
    (s, o) => s + Number(o.amount_idr ?? 0),
    0
  );
  const totalCashback = (successRes.data ?? []).reduce(
    (s, o) => s + Number(o.cashback_idr ?? 0),
    0
  );
  const totalOrders = orders.length;
  const pendingCount = pendingRes.count ?? 0;
  const productCount = productsRes.count ?? 0;

  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const byDay = last7.map((day) => {
    const count = orders.filter((o) =>
      o.created_at?.startsWith(day)
    ).length;
    return { day: day.slice(5), count };
  });
  const maxCount = Math.max(1, ...byDay.map((d) => d.count));

  const statusCount: Record<string, number> = {};
  orders.forEach((o) => {
    statusCount[o.status] = (statusCount[o.status] ?? 0) + 1;
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="text-xs text-white/50">
            Update realtime dari Supabase
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            label="Total Pesanan"
            value={totalOrders.toString()}
            sub="500 terakhir"
            tone="default"
          />
          <Stat
            label="Menunggu Bayar"
            value={pendingCount.toString()}
            sub="perlu diproses"
            tone="warn"
          />
          <Stat
            label="Pendapatan"
            value={`Rp ${totalRevenue.toLocaleString("id-ID")}`}
            sub="order sukses"
            tone="ok"
          />
          <Stat
            label="Cashback Keluar"
            value={`Rp ${totalCashback.toLocaleString("id-ID")}`}
            sub="order sukses"
            tone="default"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Pesanan 7 Hari Terakhir</h2>
                <p className="text-xs text-white/50">
                  Berdasarkan data yang sudah masuk
                </p>
              </div>
              <div className="text-xs text-white/40">
                {byDay.reduce((s, d) => s + d.count, 0)} order
              </div>
            </div>
            <div className="flex h-48 items-end gap-3">
              {byDay.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center">
                  <div className="relative w-full flex-1">
                    <div
                      className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-violet-500/40 to-fuchsia-500 transition-all"
                      style={{
                        height: `${(d.count / maxCount) * 100}%`,
                        minHeight: "4px",
                      }}
                    />
                  </div>
                  <div className="mt-2 text-[10px] text-white/50">{d.day}</div>
                  <div className="text-xs font-medium">{d.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="mb-4 font-semibold">Status Pesanan</h2>
            <ul className="space-y-2 text-sm">
              {[
                "pending",
                "paid",
                "processing",
                "success",
                "failed",
                "refunded",
              ].map((s) => (
                <li
                  key={s}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-3 py-2"
                >
                  <span className="capitalize text-white/80">{s}</span>
                  <span className="font-mono text-white">
                    {statusCount[s] ?? 0}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs text-white/50">
              {productCount} produk aktif terdaftar
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="mb-3 font-semibold">Pesanan Terbaru</h2>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase text-white/50">
                <tr>
                  <th className="px-3 py-2">Invoice</th>
                  <th className="px-3 py-2">Game</th>
                  <th className="px-3 py-2">Nominal</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="px-3 py-2 font-mono text-xs">
                      {o.invoice}
                    </td>
                    <td className="px-3 py-2">{o.game}</td>
                    <td className="px-3 py-2">{o.denomination}</td>
                    <td className="px-3 py-2">
                      Rp {Number(o.amount_idr ?? 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-3 py-2 text-xs text-white/60">
                      {new Date(o.created_at).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-white/50"
                    >
                      Belum ada pesanan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "default" | "warn" | "ok";
}) {
  const accent =
    tone === "warn"
      ? "from-amber-500/20 to-amber-500/0"
      : tone === "ok"
      ? "from-emerald-500/20 to-emerald-500/0"
      : "from-violet-500/20 to-violet-500/0";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${accent} p-5`}
    >
      <div className="text-xs uppercase tracking-wide text-white/50">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-white/50">{sub}</div>
    </div>
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
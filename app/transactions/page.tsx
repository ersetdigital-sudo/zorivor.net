"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { lookupOrder } from "../actions";

type TStatus = "success" | "processing" | "failed" | "pending" | "paid";

type Tx = {
  id: string;
  game: string;
  initial: string;
  gradient: string;
  nominal: string;
  amount: number;
  method: string;
  status: TStatus;
  date: string;
};

const GAME_META: Record<string, { initial: string; gradient: string }> = {
  "Mobile Legends": {
    initial: "ML",
    gradient: "linear-gradient(135deg,#7c5cff,#5b8cff)",
  },
  "Free Fire": {
    initial: "FF",
    gradient: "linear-gradient(135deg,#f97316,#dc2626)",
  },
  "PUBG Mobile": {
    initial: "PG",
    gradient: "linear-gradient(135deg,#0ea5e9,#1e3a8a)",
  },
  "Genshin Impact": {
    initial: "GI",
    gradient: "linear-gradient(135deg,#a78bfa,#f472b6)",
  },
  Valorant: {
    initial: "VL",
    gradient: "linear-gradient(135deg,#ef4444,#7f1d1d)",
  },
};

const STATUS_LABEL: Record<TStatus, TStatus> = {
  pending: "pending",
  paid: "paid",
  processing: "processing",
  success: "success",
  failed: "failed",
};

// Sample order database (public, no PII — anyone with the ID can track)
const ORDER_DB: Record<string, Omit<Tx, "id">> = {
  "ZRV-DEMO-X1Y2": {
    game: "Mobile Legends: Bang Bang",
    initial: "ML",
    gradient: "linear-gradient(135deg,#7c5cff,#5b8cff)",
    nominal: "86 Diamonds",
    amount: 23000,
    method: "QRIS",
    status: "processing",
    date: "Baru saja",
  },
};

const today = new Date();
const ymd = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offset);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Generic placeholder cards (no customer PII) shown below the lookup
const recent: Tx[] = [
  {
    id: "ZRV-•••-•••-A47",
    game: "Free Fire",
    initial: "FF",
    gradient: "linear-gradient(135deg,#f97316,#dc2626)",
    nominal: "720 Diamonds",
    amount: 97000,
    method: "DANA",
    status: "success",
    date: ymd(1),
  },
  {
    id: "ZRV-•••-•••-K92",
    game: "PUBG Mobile",
    initial: "PG",
    gradient: "linear-gradient(135deg,#0ea5e9,#1e3a8a)",
    nominal: "300 UC",
    amount: 78000,
    method: "GoPay",
    status: "success",
    date: ymd(2),
  },
  {
    id: "ZRV-•••-•••-M15",
    game: "Genshin Impact",
    initial: "GI",
    gradient: "linear-gradient(135deg,#a78bfa,#f472b6)",
    nominal: "300 Crystals",
    amount: 60000,
    method: "OVO",
    status: "success",
    date: ymd(4),
  },
  {
    id: "ZRV-•••-•••-R08",
    game: "Valorant",
    initial: "VL",
    gradient: "linear-gradient(135deg,#ef4444,#7f1d1d)",
    nominal: "125 Points",
    amount: 15000,
    method: "BCA VA",
    status: "success",
    date: ymd(12),
  },
];

const statusMeta: Record<
  TStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-300",
    bg: "bg-amber-400/10",
    border: "border-amber-400/25",
    dot: "bg-amber-400",
  },
  paid: {
    label: "Paid",
    color: "text-sky-300",
    bg: "bg-sky-400/10",
    border: "border-sky-400/25",
    dot: "bg-sky-400",
  },
  processing: {
    label: "Diproses",
    color: "text-violet-300",
    bg: "bg-violet-400/10",
    border: "border-violet-400/25",
    dot: "bg-violet-400 shadow-[0_0_6px_2px_rgba(167,139,250,0.5)]",
  },
  success: {
    label: "Berhasil",
    color: "text-emerald-300",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/25",
    dot: "bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]",
  },
  failed: {
    label: "Gagal",
    color: "text-pink-300",
    bg: "bg-pink-500/10",
    border: "border-pink-400/25",
    dot: "bg-pink-400 shadow-[0_0_6px_2px_rgba(244,114,182,0.5)]",
  },
};

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="lgt" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#7C5CFF" />
          <stop offset=".55" stopColor="#5B8CFF" />
          <stop offset="1" stopColor="#22E1C4" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="14" stroke="url(#lgt)" strokeWidth="3" />
      <path d="M15 16h18L19 32h14" stroke="url(#lgt)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionsInner />
    </Suspense>
  );
}

function TransactionsInner() {
  const params = useSearchParams();
  const incomingOrderId = params.get("orderId") || "";

  const [query, setQuery] = useState(incomingOrderId);
  const [result, setResult] = useState<Tx | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-lookup kalau ada ?orderId= dari query string
  useEffect(() => {
    if (incomingOrderId) {
      void lookup(incomingOrderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingOrderId]);

  async function lookup(id?: string) {
    const target = (id ?? query).trim();
    setSearched(true);
    if (!target) {
      setResult(null);
      return;
    }
    const order = await lookupOrder(target);
    if (!order) {
      setResult(null);
      return;
    }
    const meta = GAME_META[order.game] ?? {
      initial: order.game.slice(0, 2).toUpperCase(),
      gradient: "linear-gradient(135deg,#7c5cff,#5b8cff)",
    };
    const dateLabel = new Date(order.created_at).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    setResult({
      id: order.invoice,
      game: order.game,
      initial: meta.initial,
      gradient: meta.gradient,
      nominal: order.denomination,
      amount: Number(order.amount_idr),
      method: order.payment_method ?? "QRIS",
      status: (STATUS_LABEL[order.status as TStatus] ?? "processing") as TStatus,
      date: dateLabel,
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void lookup();
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/8 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <a href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="dis text-[18px] font-extrabold">ZORIVOR</span>
          </a>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="hidden rounded-xl border border-white/12 px-4 py-2 text-sm text-white/80 hover:bg-white/5 sm:block"
            >
              Beranda
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 md:py-14">
        {/* Page header */}
        <div>
          <nav className="mb-3 flex items-center gap-2 text-xs text-white/45">
            <a href="/" className="transition hover:text-white">Beranda</a>
            <span className="text-white/20">/</span>
            <span className="text-white/80">Cek Pesanan</span>
          </nav>
          <h1 className="dis text-3xl font-extrabold md:text-4xl">Cek Pesanan</h1>
          <p className="mt-2 max-w-lg text-sm text-white/55">
            Masukin <span className="font-mono text-white/80">Order ID</span> buat cek status pesanan kamu. Order ID kamu cuma kamu yang punya — jadi aman dishare ke CS kalau butuh bantuan.
          </p>
        </div>

        {/* Lookup */}
        <form
          onSubmit={onSubmit}
          className="mt-7 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 items-center gap-2 px-3 py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a9ab0" strokeWidth="1.8">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Order ID, contoh: ZRV-DEMO-X1Y2"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="!w-full !border-0 !bg-transparent !p-0 !text-sm placeholder:!text-white/35"
            />
          </div>
          <button type="submit" className="btn rounded-xl px-5 py-2.5 text-sm font-semibold">
            Lacak
          </button>
        </form>

        {/* Result */}
        {searched && (
          <div className="mt-5">
            {result ? (
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-5 backdrop-blur">
                <div className="flex items-start gap-4">
                  <div
                    className="grid size-12 shrink-0 place-items-center rounded-xl"
                    style={{ background: result.gradient }}
                  >
                    <span className="dis text-sm font-extrabold text-white">{result.initial}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-base font-semibold">{result.game}</div>
                      {(() => {
                        const m = statusMeta[result.status];
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${m.bg} ${m.border} ${m.color}`}
                          >
                            <span className={`size-1.5 rounded-full ${m.dot}`} />
                            {m.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/55">
                      <span className="font-mono">{result.id}</span>
                      <span className="text-white/20">·</span>
                      <span className="font-mono">{result.nominal}</span>
                      <span className="text-white/20">·</span>
                      <span>{result.method}</span>
                      <span className="text-white/20">·</span>
                      <span>{result.date}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="dis font-mono text-lg font-bold">{formatRp(result.amount)}</span>
                      {result.status === "processing" && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-white/55">
                          <span className="size-1.5 animate-pulse rounded-full bg-violet-400" />
                          Estimasi masuk &lt; 9 detik
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-pink-400/20 bg-pink-500/[0.06] p-4 text-sm text-white/75">
                <div className="flex items-start gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-pink-500/15">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f9a8d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Order ID tidak ditemukan</div>
                    <p className="mt-0.5 text-[12px] text-white/55">
                      Cek lagi format Order ID kamu, atau hubungi CS kalau merasa ini pesananan kamu.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent public activity */}
        <div className="mt-12">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            Aktivitas terbaru di Zorivor
          </div>
          <div className="space-y-2">
            {recent.map((t) => {
              const m = statusMeta[t.status];
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 backdrop-blur"
                >
                  <div
                    className="grid size-9 shrink-0 place-items-center rounded-lg"
                    style={{ background: t.gradient }}
                  >
                    <span className="dis text-[11px] font-extrabold text-white">{t.initial}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold">{t.game}</div>
                    <div className="font-mono text-[11px] text-white/40">{t.id}</div>
                  </div>
                  <span className="hidden font-mono text-[12px] text-white/65 sm:inline">
                    {formatRp(t.amount)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${m.bg} ${m.border} ${m.color}`}
                  >
                    <span className={`size-1.5 rounded-full ${m.dot}`} />
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-[11px] text-white/35">
            Data di atas anonim — identitas customer disensor.
          </p>
        </div>

        {/* Help */}
        <div className="mt-10 rounded-3xl border border-white/8 bg-white/[0.02] p-5 backdrop-blur">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4" />
              <path d="M12 17h.01" />
            </svg>
            Butuh bantuan?
          </div>
          <p className="text-sm text-white/65">
            Order ID ada di halaman{" "}
            <a href="/topup/success" className="text-white underline-offset-4 hover:underline">
              Thank You
            </a>{" "}
            setelah kamu pesan. Atau di email konfirmasi. Kalau hilang, hubungi{" "}
            <a
              href="https://wa.me/6281234567890"
              className="text-white underline-offset-4 hover:underline"
            >
              CS WhatsApp
            </a>{" "}
            dengan bukti transfer.
          </p>
        </div>
      </main>

      <footer className="border-t border-white/8 py-8 text-center text-xs text-white/35">
        © 2026 Zorivor. Seluruh hak cipta dilindungi.
      </footer>
    </>
  );
}

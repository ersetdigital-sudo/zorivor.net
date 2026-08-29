"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const product = {
  game: "Mobile Legends: Bang Bang",
  publisher: "Moonton",
  initial: "ML",
};

const defaultNominal = "86 Diamonds";
const defaultPrice = 23000;

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="lgs" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#7C5CFF" />
          <stop offset=".55" stopColor="#5B8CFF" />
          <stop offset="1" stopColor="#22E1C4" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="14" stroke="url(#lgs)" strokeWidth="3" />
      <path d="M15 16h18L19 32h14" stroke="url(#lgs)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(d: Date) {
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TopupSuccessPage() {
  return (
    <Suspense fallback={null}>
      <TopupSuccess />
    </Suspense>
  );
}

function TopupSuccess() {
  const params = useSearchParams();
  const orderId = params.get("invoice") || "ZRV-DEMO-X1Y2";
  const [now, setNow] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const price = defaultPrice;
  const fee = 0;
  const total = price + fee;
  const nominal = defaultNominal;

  function copyOrder() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(orderId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
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

      <main className="mx-auto max-w-3xl px-5 py-12 md:py-20">
        {/* Success header */}
        <div className="text-center">
          <div className="relative mx-auto mb-6 size-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(94,234,212,.4), transparent 60%)",
                filter: "blur(8px)",
              }}
            />
            <div
              className="relative grid size-20 place-items-center rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(94,234,212,.2), rgba(167,139,250,.15))",
                border: "1px solid rgba(94,234,212,.35)",
                boxShadow: "0 0 0 4px rgba(94,234,212,.08)",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5eead4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 13 4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />
            Pesanan diterima
          </div>
          <h1 className="dis text-3xl font-extrabold md:text-4xl">
            Pesananmu lagi diproses.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/60 md:text-base">
            Diamond akan masuk ke akun kamu otomatis. Biasanya kurang dari 9 detik. Tinggal di halaman ini sambil nunggu, atau tutup aja — notifikasi bakal dikirim.
          </p>
        </div>

        {/* Order detail card */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-white/8 bg-white/[0.02] backdrop-blur">
          {/* Header strip */}
          <div
            className="relative overflow-hidden p-5"
            style={{
              background: "linear-gradient(135deg, rgba(124,92,255,.18), rgba(34,225,196,.08))",
              borderBottom: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-50"
              style={{ background: "radial-gradient(circle, rgba(167,139,250,.4), transparent 60%)", filter: "blur(20px)" }}
            />
            <div className="relative flex items-center gap-4">
              <div
                className="grid size-14 shrink-0 place-items-center rounded-2xl"
                style={{ background: "linear-gradient(135deg, #7c5cff, #5b8cff)" }}
              >
                <span className="dis text-base font-extrabold text-white">{product.initial}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-semibold">{product.game}</div>
                <div className="text-xs text-white/45">{product.publisher}</div>
              </div>
              <div className="hidden text-right text-[11px] text-white/50 sm:block">
                <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">Order ID</div>
                <button
                  type="button"
                  onClick={copyOrder}
                  className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[12px] font-semibold text-white transition hover:bg-white/10"
                >
                  {orderId}
                  {copied ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#5eead4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {/* mobile order id */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-white/45 sm:hidden">
              <span className="font-mono">{orderId}</span>
              <button onClick={copyOrder} className="text-white/70 underline-offset-4 hover:underline">
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/45">Nominal</span>
                <span className="font-semibold">{nominal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/45">Metode bayar</span>
                <span className="font-semibold">QRIS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/45">Waktu order</span>
                <span className="text-white/80">{now ? formatDate(now) : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/45">Estimasi masuk</span>
                <span className="inline-flex items-center gap-1.5 text-white/80">
                  <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.6)]" />
                  ~9 detik
                </span>
              </div>
            </div>

            <div className="my-5 h-px bg-white/8" />

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/45">Harga</span>
                <span>{formatRp(price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/45">Biaya layanan</span>
                <span className="text-emerald-300">{formatRp(fee)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between border-t border-white/8 pt-4">
              <span className="text-[11px] uppercase tracking-wider text-white/45">Total dibayar</span>
              <span className="dis text-2xl font-extrabold">{formatRp(total)}</span>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="mt-6 rounded-3xl border border-white/8 bg-white/[0.02] p-5 backdrop-blur">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4l2.5 2.5" />
            </svg>
            Yang perlu kamu tahu
          </div>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-400" />
              <span>
                Cek in-game dulu, biasanya item sudah masuk sebelum kamu sampai ke sini.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal-400" />
              <span>
                Cek status pesananmu di halaman{" "}
                <a
                  href={`/transactions?orderId=${orderId}`}
                  className="text-white underline-offset-4 hover:underline"
                >
                  Cek Pesanan
                </a>
                .
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pink-400" />
              <span>
                Kalau lebih dari 15 menit belum masuk, hubungi{" "}
                <a
                  href="https://wa.me/6281234567890"
                  className="text-white underline-offset-4 hover:underline"
                >
                  CS WhatsApp
                </a>{" "}
                dengan Order ID di atas.
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="/" className="btn flex-1 rounded-2xl px-6 py-3.5 text-sm font-semibold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h14M13 5l-7 7 7 7" transform="rotate(180 12 12)" />
            </svg>
            Top up lagi
          </a>
          <a
            href="https://wa.me/6281234567890"
            className="flex-1 rounded-2xl border border-white/12 bg-white/5 px-6 py-3.5 text-center text-sm font-semibold text-white/85 transition hover:bg-white/10"
          >
            Hubungi CS
          </a>
        </div>
      </main>

      <footer className="border-t border-white/8 py-8 text-center text-xs text-white/35">
        © 2026 Zorivor. Seluruh hak cipta dilindungi.
      </footer>
    </>
  );
}

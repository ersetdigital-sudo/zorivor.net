"use client";

import { useEffect, useMemo, useState } from "react";
import { createOrder } from "../actions";

type Nominal = {
  id: string;
  slug: string;
  label: string;
  price: number;
  category: "diamond" | "paket";
};

type PaymentMethod = {
  id: string;
  code: string;
  label: string;
  group_label: string;
  fee_idr: number;
  sub_label: string | null;
  icon_color: string;
};

export type TopupPageProps = {
  paymentGroups: { name: string; items: PaymentMethod[] }[];
  qrisUrl: string | null;
  products: Nominal[];
};

function rp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#7C5CFF" />
          <stop offset=".55" stopColor="#5B8CFF" />
          <stop offset="1" stopColor="#22E1C4" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="14" stroke="url(#lg)" strokeWidth="3" />
      <path d="M15 16h18L19 32h14" stroke="url(#lg)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TopupForm({
  paymentGroups,
  qrisUrl,
  products,
}: TopupPageProps) {
  const [uid, setUid] = useState("");
  const [zid, setZid] = useState("");
  const [nomIdx, setNomIdx] = useState(() => {
    const idx = products.findIndex((p) => p.slug === "ml-86");
    return idx >= 0 ? idx : 0;
  });
  const [payKey, setPayKey] = useState(() => {
    const first = paymentGroups[0]?.items[0]?.label;
    return first ?? "QRIS";
  });
  const [warn, setWarn] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const flatMethods = useMemo(
    () => paymentGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.name }))),
    [paymentGroups]
  );

  const payItem =
    flatMethods.find((i) => i.label === payKey) ?? flatMethods[0];

  const nominals = products;
  const nom = nominals[nomIdx] ?? nominals[0];
  const total = (nom?.price ?? 0) + (payItem?.fee_idr ?? 0);

  useEffect(() => {
    document.body.classList.add("topup-page");
    return () => document.body.classList.remove("topup-page");
  }, []);

  function onSubmit() {
    if (!uid.trim()) {
      setWarn(true);
      const el = document.getElementById("uid");
      el?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setWarn(false);
    setSubmitting(true);

    const wa = (document.getElementById("wa") as HTMLInputElement | null)?.value ?? "";
    createOrder({
      product_slug: nom?.slug ?? "ml-86",
      game_user_id: uid,
      game_server_id: zid,
      whatsapp: wa,
      payment_method: payKey,
    })
      .then((res) => {
        if (!res.ok) {
          alert(res.error ?? "Gagal membuat pesanan");
          setSubmitting(false);
          return;
        }
        window.location.href = `/topup/success?invoice=${res.invoice}`;
      })
      .catch((e) => {
        alert(String(e));
        setSubmitting(false);
      });
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

      <section className="border-b border-white/8">
        <div className="mx-auto max-w-6xl px-5 py-7">
          <nav className="mb-5 flex items-center gap-2 text-xs text-white/40">
            <a href="/" className="hover:text-white">Beranda</a>
            <span>/</span>
            <a href="/#games" className="hover:text-white">Top Up</a>
            <span>/</span>
            <span className="text-white/70">Mobile Legends</span>
          </nav>
          <div className="flex items-center gap-5">
            <div
              className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl md:h-24 md:w-24"
              style={{ background: "linear-gradient(140deg,#7c5cff,#5b8cff)" }}
            >
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                <path d="M12 3 4 7v5c0 5 3.4 8.2 8 9 4.6-.8 8-4 8-9V7l-8-4Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="m9 12 2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold md:text-3xl">Mobile Legends: Bang Bang</h1>
              <div className="mt-1 text-sm text-white/45">Moonton</div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-white/65">
                  Proses otomatis
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-white/65">
                  Layanan 24 jam
                </span>
                <span className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-emerald-300">
                  Server aktif
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="space-y-5">
            <section className="card p-5 md:p-6">
              <div className="flex items-center gap-3">
                <span className="step">1</span>
                <h2 className="text-lg font-bold">Masukkan data akun</h2>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs text-white/50" htmlFor="uid">User ID</label>
                  <input id="uid" type="text" inputMode="numeric" placeholder="Contoh: 123456789" value={uid} onChange={(e) => setUid(e.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-xs text-white/50" htmlFor="zid">Zone ID / Server</label>
                  <input id="zid" type="text" inputMode="numeric" placeholder="Contoh: 1234" value={zid} onChange={(e) => setZid(e.target.value)} />
                </div>
              </div>
              <div className="mt-4 flex gap-2.5 rounded-xl border border-white/8 bg-white/[.03] p-3.5 text-xs leading-relaxed text-white/50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-px shrink-0">
                  <circle cx="12" cy="12" r="9" stroke="#7C5CFF" strokeWidth="1.7" />
                  <path d="M12 11v5M12 7.5h.01" stroke="#7C5CFF" strokeWidth="1.9" strokeLinecap="round" />
                </svg>
                <span>
                  Buka game → klik profil di pojok kiri atas. ID kamu tertulis seperti{" "}
                  <b className="text-white/75">123456789 (1234)</b>. Angka dalam kurung adalah Zone ID.
                </span>
              </div>
            </section>

            <section className="card p-5 md:p-6">
              <div className="flex items-center gap-3">
                <span className="step">2</span>
                <h2 className="text-lg font-bold">Pilih nominal</h2>
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/40">Diamond</div>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {nominals
                  .filter((n) => n.category === "diamond")
                  .map((n, i) => (
                    <label key={n.id} className="opt">
                      <input
                        type="radio"
                        name="nom"
                        checked={nomIdx === nominals.indexOf(n)}
                        onChange={() => setNomIdx(nominals.indexOf(n))}
                      />
                      <div className="box">
                        <div className="text-sm font-semibold">{n.label}</div>
                        <div className="mt-1 text-xs text-white/50">{rp(n.price)}</div>
                      </div>
                    </label>
                  ))}
                {nominals.filter((n) => n.category === "diamond").length === 0 && (
                  <div className="col-span-full rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center text-xs text-white/50">
                    Belum ada produk
                  </div>
                )}
              </div>
              {nominals.some((n) => n.category === "paket") && (
                <>
                  <div className="mt-6 text-xs font-semibold uppercase tracking-wider text-white/40">Paket khusus</div>
                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {nominals
                      .filter((n) => n.category === "paket")
                      .map((n) => (
                        <label key={n.id} className="opt">
                          <input
                            type="radio"
                            name="nom"
                            checked={nomIdx === nominals.indexOf(n)}
                            onChange={() => setNomIdx(nominals.indexOf(n))}
                          />
                          <div className="box">
                            <div className="text-sm font-semibold">{n.label}</div>
                            <div className="mt-1 text-xs text-white/50">{rp(n.price)}</div>
                          </div>
                        </label>
                      ))}
                  </div>
                </>
              )}
            </section>

            <section className="card p-5 md:p-6">
              <div className="flex items-center gap-3">
                <span className="step">3</span>
                <h2 className="text-lg font-bold">Metode pembayaran</h2>
              </div>
              {paymentGroups.map((g) => (
                <div key={g.name} className="mt-5 first:mt-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/40">{g.name}</div>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {g.items.map((p) => {
                      const isQris = p.code === "qris";
                      return (
                        <label key={p.id} className="opt">
                          <input
                            type="radio"
                            name="pay"
                            checked={payKey === p.label}
                            onChange={() => setPayKey(p.label)}
                          />
                          <div className="box flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="inline-block h-2.5 w-2.5 rounded-full"
                                  style={{ background: p.icon_color }}
                                />
                                <span className="text-sm font-semibold">{p.label}</span>
                              </div>
                              {p.sub_label && (
                                <div className="mt-0.5 text-[11px] text-white/45">{p.sub_label}</div>
                              )}
                            </div>
                            {p.fee_idr === 0 ? (
                              <span className="text-[11px] text-emerald-300">Gratis biaya</span>
                            ) : (
                              <span className="text-[11px] text-white/40">+ {rp(p.fee_idr)}</span>
                            )}
                          </div>
                          {isQris && qrisUrl && (
                            <div className="mt-2 flex justify-center rounded-lg bg-white p-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={qrisUrl}
                                alt="QRIS"
                                className="h-32 w-32 object-contain"
                              />
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>

            <section className="card p-5 md:p-6">
              <div className="flex items-center gap-3">
                <span className="step">4</span>
                <h2 className="text-lg font-bold">Kontak (opsional)</h2>
              </div>
              <div className="mt-5 max-w-sm">
                <label className="mb-2 block text-xs text-white/50" htmlFor="wa">Nomor WhatsApp</label>
                <input id="wa" type="text" inputMode="tel" placeholder="08xxxxxxxxxx" />
                <p className="mt-2 text-xs text-white/40">Buat kirim bukti transaksi. Boleh dikosongin.</p>
              </div>
            </section>
          </div>

          <aside className="card p-5 lg:sticky lg:top-24">
            <h2 className="text-base font-bold">Ringkasan pesanan</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-white/45">Produk</span>
                <span className="text-right font-medium">Mobile Legends</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/45">Akun</span>
                <span className={`text-right font-medium ${uid ? "" : "text-white/45"}`}>
                  {uid ? `${uid}${zid ? ` (${zid})` : ""}` : "Belum diisi"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/45">Nominal</span>
                <span className="text-right font-medium">{nom.label}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/45">Metode</span>
                <span className="text-right font-medium">{payKey}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/45">Harga</span>
                <span>{rp(nom.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/45">Biaya layanan</span>
                <span className={payItem?.fee_idr ? "text-white/70" : "text-emerald-300"}>{rp(payItem?.fee_idr ?? 0)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
              <span className="text-xs text-white/45">Total bayar</span>
              <span className="dis text-2xl font-extrabold">{rp(total)}</span>
            </div>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="btn mt-5 w-full rounded-xl py-3.5 font-bold text-white disabled:opacity-70"
            >
              {submitting ? "Membuat invoice…" : "Pesan Sekarang"}
            </button>
            <p className={`mt-3 text-center text-xs text-[#ff9ec4] ${warn ? "" : "hidden"}`}>
              Isi User ID dulu ya.
            </p>
            <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-[11px] text-white/40">
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3 4 6.5V12c0 4.6 3.3 7.8 8 9 4.7-1.2 8-4.4 8-9V6.5L12 3Z" stroke="#22E1C4" strokeWidth="1.9" strokeLinejoin="round" />
                </svg>
                Transaksi aman &amp; supply resmi
              </div>
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#22E1C4" strokeWidth="1.9" />
                  <path d="M12 7v5l3 2" stroke="#22E1C4" strokeWidth="1.9" strokeLinecap="round" />
                </svg>
                Proses rata-rata di bawah 10 detik
              </div>
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" stroke="#22E1C4" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Gagal? Dana kembali 100%
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-black/90 p-3.5 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-white/45">Total bayar</div>
            <div className="dis text-lg font-extrabold">{rp(total)}</div>
          </div>
          <button onClick={onSubmit} className="btn rounded-xl px-7 py-3 font-bold text-white">
            Pesan
          </button>
        </div>
      </div>

      <footer className="border-t border-white/8 py-8 text-center text-xs text-white/35">
        © 2026 Zorivor. Seluruh hak cipta dilindungi.
      </footer>
    </>
  );
}

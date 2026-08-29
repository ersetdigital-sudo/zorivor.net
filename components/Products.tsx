"use client";

import { useState } from "react";
import Image from "next/image";

export type LandingCard = {
  id: string;
  name: string;
  publisher: string;
  category: string;
  cover?: string | null;
  bg: string;
  is_popular: boolean;
  is_hot: boolean;
};

type Card = {
  id: string;
  name: string;
  publisher: string;
  cat: string;
  cover?: string | null;
  bg: string;
  href: string;
  is_hot: boolean;
};

const FALLBACK_BG: Record<string, string> = {
  populer: "#140b22",
  topup: "linear-gradient(140deg,#a58bff,#5b8cff)",
  steam: "linear-gradient(140deg,#334155,#0f172a)",
  voucher: "linear-gradient(140deg,#7c5cff,#22e1c4)",
  hiburan: "linear-gradient(140deg,#ef4444,#7f1d1d)",
};

const tabs = [
  { key: "populer", label: "Lagi Populer" },
  { key: "topup", label: "Top Up" },
  { key: "steam", label: "Steam Game" },
  { key: "voucher", label: "Voucher" },
  { key: "hiburan", label: "Entertainment" },
];

export function Products({ dynamicCards = [] }: { dynamicCards?: LandingCard[] }) {
  const [active, setActive] = useState("populer");

  // Build card list entirely from Supabase data (no hardcoded staticCards)
  const allCards: Card[] = dynamicCards.map((c) => ({
    id: c.id,
    name: c.name,
    publisher: c.publisher,
    cat: c.category || "populer",
    cover: c.cover,
    bg: c.bg || FALLBACK_BG[c.category] || "#140b22",
    href: `/topup?game=${c.id}`,
    is_hot: c.is_hot,
  }));

  // Filter: "Lagi Populer" uses is_popular flag from DB
  const filtered =
    active === "populer"
      ? allCards.filter((c) => {
          const dc = dynamicCards.find((d) => d.id === c.id);
          return dc?.is_popular;
        })
      : allCards.filter((c) => c.cat === active);

  return (
    <section id="games" className="relative mx-auto max-w-6xl px-5 py-16">
      {/* Header */}
      <div className="rise flex flex-wrap items-center justify-between gap-4">
        <h2 id="secTitle" className="text-2xl font-bold md:text-3xl">
          {tabs.find((t) => t.key === active)?.label}
        </h2>
        <a
          href="/topup"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/75 hover:bg-white/5"
        >
          Tampilkan semua
        </a>
      </div>

      {/* Category tabs — pill style */}
      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? "border-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold"
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Game cards grid */}
      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filtered.map((c, i) => (
          <a
            key={c.id}
            href={c.href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-0 transition-all duration-200 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-[0_8px_30px_rgba(124,92,255,0.15)]"
          >
            {/* Cover image */}
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3/4", background: c.bg }}>
              {c.cover ? (
                <Image
                  src={c.cover}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 180px"
                  priority={i < 6}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-80">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <path d="M12 6v12" />
                    <path d="M2 12h20" />
                  </svg>
                </div>
              )}

              {/* HOT badge */}
              {c.is_hot && (
                <div className="absolute right-2 top-2 rounded-md bg-gradient-to-r from-orange-500 to-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-lg">
                  HOT
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="truncate text-sm font-semibold text-white leading-tight">
                {c.name}
              </div>
              <div className="mt-0.5 truncate text-[12px] text-white/60">
                {c.publisher}
              </div>
            </div>
          </a>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center text-sm text-white/50">
            Belum ada game di kategori ini.
          </div>
        )}
      </div>
    </section>
  );
}

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
};

type Card = {
  name: string;
  publisher: string;
  cat: "populer" | "topup" | "steam" | "voucher" | "hiburan";
  cover?: string;
  bg?: string;
  icon?: React.ReactNode;
  href?: string;
};

const Star = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFC53D">
    <path d="m12 2 3 6.5 7 .9-5 4.8 1.3 7L12 17.8 5.7 21.2 7 14.2 2 9.4l7-.9L12 2Z" />
  </svg>
);

const staticCards: Card[] = [
  { name: "Magic Chess: Go Go", publisher: "Moonton", cat: "populer", cover: "/images/aad53178-087b-4d6c-8ad1-daebad3f6cf0.png", bg: "#140b22" },
  { name: "Mobile Legends", publisher: "Moonton", cat: "populer", cover: "/images/73f2aa19-ccb6-481f-85c5-3f867e3b2a1f.png", bg: "#1a0b2e" },
  { name: "Free Fire", publisher: "Garena", cat: "populer", cover: "/images/9b0ee7e6-306d-4168-83f4-93b4c6e5aee5.webp", bg: "#1a0f07" },
  { name: "PUBG Mobile", publisher: "Tencent", cat: "populer", cover: "/images/a14f845b-125a-4af4-bca2-1de3d469f6fd.png", bg: "#12161c" },
  { name: "Genshin Impact", publisher: "HoYoverse", cat: "populer", cover: "/images/22a5de62-a708-4599-9068-13a7300bfefb.png", bg: "#12161c" },
  {
    name: "Honor of Kings",
    publisher: "Level Infinite",
    cat: "topup",
    bg: "linear-gradient(140deg,#a58bff,#5b8cff)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M7 8h10l2 8H5l2-8Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 12h2M10 11v2M15 12h.01" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  { name: "Call of Duty Mobile", publisher: "Activision", cat: "populer", cover: "/images/83f2ad77-be36-4fea-bee0-221a760dbf18.png", bg: "#12161c" },
  {
    name: "Arena of Valor",
    publisher: "Garena",
    cat: "topup",
    bg: "linear-gradient(140deg,#8b5cf6,#ec4899)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="m12 3 2.2 5.6L20 10l-4.4 3.7L17 20l-5-3.2L7 20l1.4-6.3L4 10l5.8-1.4L12 3Z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Point Blank",
    publisher: "Zepetto",
    cat: "topup",
    bg: "linear-gradient(140deg,#0ea5e9,#1e3a8a)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="#fff" strokeWidth="1.6" />
        <path d="M12 4v4M12 16v4M4 12h4M16 12h4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Steam Wallet",
    publisher: "Valve",
    cat: "steam",
    bg: "linear-gradient(140deg,#334155,#0f172a)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.6" />
        <circle cx="15" cy="9.5" r="2.6" stroke="#fff" strokeWidth="1.6" />
        <path d="M4 15.5 10 13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Counter-Strike 2",
    publisher: "Valve",
    cat: "steam",
    bg: "linear-gradient(140deg,#f59e0b,#78350f)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M3 12h5l2-3 3 8 2-5h6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Dota 2",
    publisher: "Valve",
    cat: "steam",
    bg: "linear-gradient(140deg,#dc2626,#450a0a)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h7v7H4zM13 13h7v7h-7z" stroke="#fff" strokeWidth="1.6" />
        <path d="M11 11 20 4M4 20l9-7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Google Play",
    publisher: "Google",
    cat: "voucher",
    bg: "linear-gradient(140deg,#22c55e,#0ea5e9)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M5 3.5 17 12 5 20.5V3.5Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Voucher Pulsa",
    publisher: "All Operator",
    cat: "voucher",
    bg: "linear-gradient(140deg,#7c5cff,#22e1c4)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="12" rx="3" stroke="#fff" strokeWidth="1.6" />
        <path d="M7 12h6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Token Listrik",
    publisher: "PLN",
    cat: "voucher",
    bg: "linear-gradient(140deg,#facc15,#b45309)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Netflix Premium",
    publisher: "Netflix",
    cat: "hiburan",
    bg: "linear-gradient(140deg,#ef4444,#7f1d1d)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M7 4v16M17 4v16M7 4l10 16" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Spotify Premium",
    publisher: "Spotify",
    cat: "hiburan",
    bg: "linear-gradient(140deg,#22e1c4,#16a34a)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#04241f" strokeWidth="1.6" />
        <path d="M8 10c3-.8 5.5-.4 8 1M8.5 13c2.4-.6 4.4-.3 6.3.9" stroke="#04241f" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Vidio Platinum",
    publisher: "Vidio",
    cat: "hiburan",
    bg: "linear-gradient(140deg,#5b8cff,#7c5cff)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16v12H4z" stroke="#fff" strokeWidth="1.6" />
        <path d="m10 9 5 3-5 3V9Z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "YouTube Premium",
    publisher: "Google",
    cat: "hiburan",
    bg: "linear-gradient(140deg,#ef4444,#991b1b)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="12" rx="4" stroke="#fff" strokeWidth="1.6" />
        <path d="m10 9.5 5 2.5-5 2.5v-5Z" fill="#fff" />
      </svg>
    ),
  },
];

const tabs: { key: Card["cat"]; label: string }[] = [
  { key: "populer", label: "Lagi Populer" },
  { key: "topup", label: "Top Up" },
  { key: "steam", label: "Steam Game" },
  { key: "voucher", label: "Voucher" },
  { key: "hiburan", label: "Entertainment" },
];

export function Products({ dynamicCards = [] }: { dynamicCards?: LandingCard[] }) {
  const [active, setActive] = useState<Card["cat"]>("populer");

  // Merge dynamic DB-driven cards with static catalog; dedupe by name
  const dynamicNames = new Set(
    dynamicCards.map((c) => c.name.trim().toLowerCase())
  );
  const dynamicAsCards: Card[] = dynamicCards.map((c) => ({
    name: c.name,
    publisher: c.publisher,
    cat:
      c.category === "steam"
        ? "steam"
        : c.category === "voucher"
        ? "voucher"
        : c.category === "hiburan"
        ? "hiburan"
        : c.category === "topup"
        ? "topup"
        : "populer",
    cover: c.cover ?? undefined,
    bg: c.bg,
    href: `/topup?game=${c.id}`,
  }));

  const allCards: Card[] = [
    ...dynamicAsCards,
    ...staticCards.filter(
      (c) => !dynamicNames.has(c.name.trim().toLowerCase())
    ),
  ];

  const filtered = allCards.filter((c) => c.cat === active);
  // Dynamic count helps decide grid density
  const count = filtered.length;

  return (
    <section id="games" className="relative mx-auto max-w-6xl px-5 py-16">
      {/* Header */}
      <div className="rise flex flex-wrap items-center justify-between gap-4">
        <h2 id="secTitle" className="text-2xl font-bold md:text-3xl">
          {tabs.find((t) => t.key === active)?.label}
        </h2>
        <a
          href="#"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/75 hover:bg-white/5"
        >
          Tampilkan lebih banyak
        </a>
      </div>

      {/* Category tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={`tab rounded-xl border border-white/10 px-4 py-2 text-sm text-white/65 transition ${active === t.key ? "on" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Game cards */}
      <div
        className="mt-7 grid gap-3"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))`,
        }}
      >
        {filtered.map((c, i) => (
          <a
            key={c.name + (c.href ?? "")}
            href={c.href ?? "/topup"}
            data-cat={c.cat}
            className="pcard card group overflow-hidden p-0 transition hover:ring-1 hover:ring-violet-400/40"
          >
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: "3/4", background: c.bg }}
            >
              {c.cover ? (
                <Image
                  src={c.cover}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 180px"
                  priority={i < 3}
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-90">
                  {c.icon}
                </div>
              )}
              {/* Badge */}
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                <Star />
                5.0
              </div>
            </div>
            {/* Info */}
            <div className="p-3">
              <div className="truncate text-[13px] font-semibold leading-tight">
                {c.name}
              </div>
              <div className="mt-0.5 truncate text-[11px] text-white/40">
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

"use client";

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

// Predefined gradient backgrounds per game category for placeholder
const CATEGORY_BG: Record<string, string> = {
  populer: "linear-gradient(135deg,#f97316 0%,#ec4899 100%)",
  topup: "linear-gradient(135deg,#7c5cff 0%,#5b8cff 100%)",
  steam: "linear-gradient(135deg,#0ea5e9 0%,#1e3a8a 100%)",
  voucher: "linear-gradient(135deg,#22c55e 0%,#06b6d4 100%)",
  hiburan: "linear-gradient(135deg,#ef4444 0%,#f43f5e 100%)",
};

const FALLBACK_CARDS = [
  { id: "ml-1", name: "Mobile Legends", publisher: "Moonton", category: "populer", cover: "/images/73f2aa19-ccb6-481f-85c5-3f867e3b2a1f.png", bg: "linear-gradient(135deg,#f97316 0%,#ec4899 100%)", is_popular: true, is_hot: false },
  { id: "ff-1", name: "Free Fire", publisher: "Garena", category: "populer", cover: "/images/9b0ee7e6-306d-4168-83f4-93b4c6e5aee5.webp", bg: "linear-gradient(135deg,#7c3aed 0%,#1e1b4b 100%)", is_popular: true, is_hot: false },
  { id: "pubg-1", name: "PUBG Mobile", publisher: "Tencent", category: "populer", cover: "/images/a14f845b-125a-4af4-bca2-1de3d469f6fd.png", bg: "linear-gradient(135deg,#0ea5e9 0%,#3b82f6 100%)", is_popular: true, is_hot: false },
  { id: "genshin-1", name: "Genshin Impact", publisher: "HoYoverse", category: "populer", cover: "/images/22a5de62-a708-4599-9068-13a7300bfefb.png", bg: "linear-gradient(135deg,#84cc16 0%,#06b6d4 100%)", is_popular: true, is_hot: false },
  { id: "mc-1", name: "Magic Chess: Go Go", publisher: "Moonton", category: "populer", cover: "/images/aad53178-087b-4d6c-8ad1-daebad3f6cf0.png", bg: "linear-gradient(135deg,#f59e0b 0%,#7c2d12 100%)", is_popular: true, is_hot: false },
];

export function Products({ dynamicCards = [] }: { dynamicCards?: LandingCard[] }) {
  const cards = dynamicCards.length > 0 ? dynamicCards : FALLBACK_CARDS;

  return (
    <section id="games" className="mx-auto max-w-6xl px-5 pb-28 pt-16 md:pb-16">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          Pilih Game Favoritmu
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Top up instan, proses otomatis, harga termurah
        </p>
      </div>

      {/* Game list — horizontal tile layout */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <a
            key={c.id}
            href={`/topup?game=${c.id}`}
            className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition-all duration-200 hover:border-violet-400/50 hover:bg-white/[0.06] hover:shadow-[0_4px_20px_rgba(124,92,255,0.15)]"
          >
            {/* Cover image — left side square */}
            <div
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl"
              style={{ background: c.bg || CATEGORY_BG[c.category] || "#1e1b4b" }}
            >
              {c.cover ? (
                <Image
                  src={c.cover}
                  alt={c.name}
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl text-white/50">
                  🎮
                </span>
              )}
              {c.is_hot && (
                <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                  🔥
                </span>
              )}
            </div>

            {/* Info — right side */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-white">
                {c.name}
              </h3>
              <p className="mt-0.5 truncate text-xs text-white/55">
                {c.publisher}
              </p>
              <p className="mt-1 text-[10px] text-violet-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Top up sekarang →
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

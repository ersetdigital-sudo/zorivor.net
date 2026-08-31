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

// Static fallback games (shown when Supabase data is empty)
const FALLBACK_CARDS: LandingCard[] = [
  { id: "ml-1", name: "Mobile Legends", publisher: "Moonton", category: "populer", cover: "/images/73f2aa19-ccb6-481f-85c5-3f867e3b2a1f.png", bg: "#1a0b2e", is_popular: true, is_hot: false },
  { id: "ff-1", name: "Free Fire", publisher: "Garena", category: "populer", cover: "/images/9b0ee7e6-306d-4168-83f4-93b4c6e5aee5.webp", bg: "#1a0f07", is_popular: true, is_hot: false },
  { id: "pubg-1", name: "PUBG Mobile", publisher: "Tencent", category: "populer", cover: "/images/a14f845b-125a-4af4-bca2-1de3d469f6fd.png", bg: "#12161c", is_popular: true, is_hot: false },
  { id: "genshin-1", name: "Genshin Impact", publisher: "HoYoverse", category: "populer", cover: "/images/22a5de62-a708-4599-9068-13a7300bfefb.png", bg: "#12161c", is_popular: true, is_hot: false },
  { id: "mc-1", name: "Magic Chess: Go Go", publisher: "Moonton", category: "populer", cover: "/images/aad53178-087b-4d6c-8ad1-daebad3f6cf0.png", bg: "#140b22", is_popular: true, is_hot: false },
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

      {/* Game grid — no tabs, all games shown directly */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {cards.map((c) => (
          <a
            key={c.id}
            href={`/topup?game=${c.id}`}
            className="group relative block overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-200 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-[0_8px_30px_rgba(124,92,255,0.15)]"
          >
            {/* Cover */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
              {c.cover ? (
                <Image
                  src={c.cover}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl text-white/20">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <path d="M12 6v12" />
                    <path d="M2 12h20" />
                  </svg>
                </div>
              )}
              {/* HOT badge */}
              {c.is_hot && (
                <span className="absolute right-2 top-2 rounded-md bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                  HOT
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="truncate text-sm font-semibold text-white">
                {c.name}
              </h3>
              <p className="mt-0.5 truncate text-xs text-white/60">
                {c.publisher}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

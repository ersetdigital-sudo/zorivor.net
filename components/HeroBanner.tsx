"use client";

import { useEffect } from "react";
import Image from "next/image";
import Swiper from "swiper";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

type Slide = {
  src: string;
  alt: string;
  // Source dimensions of the file (used by next/image to prevent CLS)
  width: number;
  height: number;
};

// Real file is 2304×963 (2.39:1). next/image generates the right
// responsive sizes via deviceSizes on the <Image>.
const SLIDES: Slide[] = [
  {
    src: "/images/hero-slide-1.png",
    alt: "Top up game tanpa biaya admin",
    width: 2304,
    height: 963,
  },
  {
    src: "/images/hero-slide-2.png",
    alt: "Cashback 20% di transaksi pertama",
    width: 2304,
    height: 963,
  },
  {
    src: "/images/hero-slide-3.png",
    alt: "Pesan 24 jam, item langsung masuk",
    width: 2304,
    height: 963,
  },
];

export function HeroBanner() {
  useEffect(() => {
    const el = document.querySelector(".bannerSwiper");
    if (!el) return;
    const s = new Swiper(".bannerSwiper", {
      modules: [Pagination, Autoplay],
      loop: true,
      speed: 700,
      autoplay: { delay: 4500 },
      pagination: { el: ".swiper-pagination", clickable: true },
    });
    return () => s.destroy();
  }, []);

  return (
    <section className="relative pt-28 md:pt-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="swiper bannerSwiper overflow-hidden rounded-[20px] border border-white/10">
          <div className="swiper-wrapper">
            {SLIDES.map((s, i) => (
              <div key={i} className="swiper-slide">
                <a
                  href="/topup"
                  className="bslide relative block w-full overflow-hidden"
                  aria-label={s.alt}
                >
                  <Image
                    src={s.src}
                    alt={s.alt}
                    width={s.width}
                    height={s.height}
                    sizes="(min-width: 1152px) 1152px, 100vw"
                    quality={75}
                    priority={i === 0}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="block h-auto w-full"
                  />
                </a>
              </div>
            ))}
          </div>
          <div className="swiper-pagination" />
        </div>
      </div>
    </section>
  );
}

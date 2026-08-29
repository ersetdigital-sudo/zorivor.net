"use client";

import { useEffect } from "react";
import Swiper from "swiper";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

type Slide = {
  src: string;
  alt: string;
};

const SLIDES: Slide[] = [
  { src: "/images/hero-slide-1.png", alt: "Top up game tanpa biaya admin" },
  { src: "/images/hero-slide-2.png", alt: "Cashback 20% di transaksi pertama" },
  { src: "/images/hero-slide-3.png", alt: "Pesan 24 jam, item langsung masuk" },
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.src}
                    alt={s.alt}
                    width={2304}
                    height={963}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
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

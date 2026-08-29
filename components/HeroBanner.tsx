"use client";

import { useEffect } from "react";
import Swiper from "swiper";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

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
            <div className="swiper-slide">
              <div
                className="bslide relative w-full overflow-hidden"
                style={{ background: "#100f1e" }}
              >
                <div
                  className="absolute -right-16 top-1/2 h-[130%] w-[52%] -translate-y-1/2 rotate-12 rounded-[40px]"
                  style={{
                    background:
                      "linear-gradient(160deg,rgba(124,92,255,.55),rgba(34,225,196,.18))",
                  }}
                />
                <div className="absolute right-[14%] top-1/2 h-24 w-24 -translate-y-1/2 rounded-2xl border border-white/20 md:h-40 md:w-40 md:rounded-[28px]" />
                <div className="absolute right-[6%] bottom-[14%] h-16 w-16 rounded-full border border-white/15 md:h-28 md:w-28" />
                <div className="absolute inset-0 flex flex-col justify-center gap-2.5 p-6 md:p-14">
                  <span className="w-max rounded-md bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.18em] text-white/80 md:text-[11px]">
                    Promo bulan ini
                  </span>
                  <h2 className="max-w-[70%] text-[20px] font-extrabold leading-[1.12] md:max-w-md md:text-[40px]">
                    Top up game
                    <br />
                    <span style={{ color: "#22e1c4" }}>tanpa biaya admin</span>
                  </h2>
                  <p className="hidden max-w-sm text-sm text-white/55 md:block">
                    Harga final termurah, masuk otomatis rata-rata 9 detik.
                  </p>
                  <a
                    href="/topup"
                    className="mt-2 w-max rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#0b0b12] transition hover:bg-white/85 md:px-6 md:py-3 md:text-sm"
                  >
                    Top Up Sekarang
                  </a>
                </div>
              </div>
            </div>

            <div className="swiper-slide">
              <div
                className="bslide relative w-full overflow-hidden"
                style={{ background: "#170d14" }}
              >
                <div
                  className="absolute right-0 top-0 h-full w-[55%]"
                  style={{
                    background:
                      "radial-gradient(circle at 70% 50%,rgba(255,77,141,.45),transparent 62%)",
                  }}
                />
                <div className="absolute right-[18%] top-1/2 h-28 w-28 -translate-y-1/2 rotate-45 border border-white/20 md:h-44 md:w-44" />
                <div className="absolute right-[8%] top-[22%] h-2 w-24 rounded-full bg-white/25 md:w-40" />
                <div className="absolute right-[8%] bottom-[22%] h-2 w-16 rounded-full bg-white/15 md:w-28" />
                <div className="absolute inset-0 flex flex-col justify-center gap-2.5 p-6 md:p-14">
                  <span className="w-max rounded-md bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.18em] text-white/80 md:text-[11px]">
                    Member baru
                  </span>
                  <h2 className="max-w-[70%] text-[20px] font-extrabold leading-[1.12] md:max-w-md md:text-[40px]">
                    Cashback 20%
                    <br />
                    <span style={{ color: "#ff7ab0" }}>di transaksi pertama</span>
                  </h2>
                  <p className="hidden max-w-sm text-sm text-white/55 md:block">
                    Berlaku untuk semua game dan semua metode pembayaran.
                  </p>
                  <a
                    href="/topup"
                    className="mt-2 w-max rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#0b0b12] transition hover:bg-white/85 md:px-6 md:py-3 md:text-sm"
                  >
                    Klaim Promo
                  </a>
                </div>
              </div>
            </div>

            <div className="swiper-slide">
              <div
                className="bslide relative w-full overflow-hidden"
                style={{ background: "#0c1220" }}
              >
                <div
                  className="absolute inset-y-0 right-0 w-[55%]"
                  style={{
                    background:
                      "linear-gradient(120deg,transparent,rgba(91,140,255,.42))",
                  }}
                />
                <div
                  className="absolute right-[10%] top-1/2 h-32 w-32 -translate-y-1/2 rounded-full md:h-52 md:w-52"
                  style={{
                    background:
                      "conic-gradient(from 210deg,#5b8cff,#22e1c4,#7c5cff,#5b8cff)",
                    opacity: 0.75,
                    filter: "blur(2px)",
                  }}
                />
                <div className="absolute right-[10%] top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-white/25 md:h-52 md:w-52" />
                <div className="absolute inset-0 flex flex-col justify-center gap-2.5 p-6 md:p-14">
                  <span className="w-max rounded-md bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.18em] text-white/80 md:text-[11px]">
                    24 jam nonstop
                  </span>
                  <h2 className="max-w-[70%] text-[20px] font-extrabold leading-[1.12] md:max-w-md md:text-[40px]">
                    Pesan jam berapa pun
                    <br />
                    <span style={{ color: "#7ea8ff" }}>item langsung masuk</span>
                  </h2>
                  <p className="hidden max-w-sm text-sm text-white/55 md:block">
                    Sistem otomatis, CS aktif 24/7 termasuk dini hari.
                  </p>
                  <a
                    href="/topup"
                    className="mt-2 w-max rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#0b0b12] transition hover:bg-white/85 md:px-6 md:py-3 md:text-sm"
                  >
                    Lihat Katalog
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="swiper-pagination" />
        </div>
      </div>
    </section>
  );
}

export function PaymentMethods() {
  const list = [
    "QRIS",
    "DANA",
    "GoPay",
    "OVO",
    "ShopeePay",
    "LinkAja",
    "BCA VA",
    "BRI VA",
    "Mandiri VA",
    "Alfamart",
    "Indomaret",
    "Pulsa",
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16">
      <div className="rise text-center text-xs uppercase tracking-[.25em] text-white/35">
        Metode pembayaran
      </div>
      <div className="rise mt-5 flex flex-wrap items-center justify-center gap-2.5">
        {list.map((m) => (
          <span
            key={m}
            className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-sm font-medium text-white/70"
          >
            {m}
          </span>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Pilih game & nominal",
      desc: "Cari judul favoritmu, pilih paket diamond atau item yang kamu mau.",
      icon: (
        <rect x="3" y="5" width="18" height="14" rx="3" stroke="#7C5CFF" strokeWidth="1.8" />
      ),
      dots: (
        <>
          <path d="M8 12h.01M12 12h.01M16 12h.01" stroke="#7C5CFF" strokeWidth="2.4" strokeLinecap="round" />
        </>
      ),
    },
    {
      n: "02",
      title: "Bayar sesukamu",
      desc: "QRIS, DANA, GoPay, OVO, ShopeePay, VA bank, sampai gerai retail.",
      icon: (
        <>
          <path d="M4 8h16v10H4z" stroke="#22E1C4" strokeWidth="1.8" />
          <path d="M4 11h16" stroke="#22E1C4" strokeWidth="1.8" />
          <path d="M7 15h4" stroke="#22E1C4" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ),
      dots: null,
    },
    {
      n: "03",
      title: "Masuk otomatis",
      desc: "Item langsung masuk ke akun rata-rata di bawah 10 detik. Tanpa nunggu.",
      icon: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke="#FF4D8D" strokeWidth="1.8" strokeLinejoin="round" />,
      dots: null,
    },
  ];

  return (
    <section id="cara" className="relative border-y border-white/8 bg-white/[.02] py-24">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="rise text-3xl font-bold md:text-4xl">Tiga langkah, beres.</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rise card p-7">
              <div className="dis text-sm text-white/35">{s.n}</div>
              <svg className="mt-4" width="30" height="30" viewBox="0 0 24 24" fill="none">
                {s.icon}
                {s.dots}
              </svg>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Why() {
  const items = [
    {
      title: "Legal & resmi",
      desc: "Supply langsung dari distributor resmi, aman untuk akunmu.",
      icon: <path d="M12 3 4 6.5V12c0 4.6 3.3 7.8 8 9 4.7-1.2 8-4.4 8-9V6.5L12 3Z" stroke="#7C5CFF" strokeWidth="1.8" strokeLinejoin="round" />,
    },
    {
      title: "CS 24/7",
      desc: "Ada kendala? Tim kami jawab kapan pun, termasuk dini hari.",
      icon: (
        <>
          <circle cx="12" cy="12" r="9" stroke="#22E1C4" strokeWidth="1.8" />
          <path d="M12 7v5l3 2" stroke="#22E1C4" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ),
    },
    {
      title: "Harga final",
      desc: "Nol biaya admin. Tidak ada biaya kejutan di akhir checkout.",
      icon: <path d="M4 18V9M10 18V5M16 18v-6M22 18H2" stroke="#FF4D8D" strokeWidth="1.8" strokeLinecap="round" />,
    },
    {
      title: "Garansi uang kembali",
      desc: "Pesanan gagal? Dana kembali penuh, otomatis.",
      icon: (
        <>
          <path d="M20 12a8 8 0 1 1-2.3-5.6" stroke="#5B8CFF" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M20 4v4h-4" stroke="#5B8CFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ),
    },
  ];
  return (
    <section id="kenapa" className="mx-auto max-w-6xl px-5 py-24">
      <div className="grid gap-14 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div className="rise">
          <h2 className="text-3xl font-bold md:text-4xl">
            Kenapa <span className="grad">Zorivor</span>?
          </h2>
          <p className="mt-4 text-white/55">
            Kami bangun ulang pengalaman top up biar sesimpel kirim chat. Harga yang kamu lihat adalah
            harga yang kamu bayar.
          </p>
          <a href="#games" className="btn mt-8 inline-block rounded-2xl px-6 py-3.5 font-semibold text-white">
            Coba sekarang
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((i) => (
            <div key={i.title} className="rise card p-6">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                {i.icon}
              </svg>
              <h3 className="mt-3 font-semibold">{i.title}</h3>
              <p className="mt-1.5 text-sm text-white/55">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const faqs = [
    {
      q: "Apa untungnya top up di Zorivor?",
      a: "Harga final termurah tanpa biaya admin, proses otomatis 24 jam, dan supply resmi sehingga akunmu tetap aman.",
    },
    {
      q: "Game apa saja yang tersedia?",
      a: "Semua game populer seperti Mobile Legends, Free Fire, PUBG, Genshin, Magic Chess, plus 340+ judul lain, pulsa, dan e-money.",
    },
    {
      q: "Bagaimana cara top up-nya?",
      a: "Pilih game, masukkan User ID, pilih nominal, lalu bayar. Item masuk otomatis tanpa perlu login akun game.",
    },
    {
      q: "Metode pembayaran apa saja?",
      a: "QRIS, DANA, GoPay, OVO, ShopeePay, virtual account bank, transfer bank, hingga pembayaran di gerai retail.",
    },
    {
      q: "Kalau item belum masuk?",
      a: "Hubungi CS kami lewat WhatsApp atau email. Jika pesanan gagal diproses, dana dikembalikan penuh.",
    },
  ];
  return (
    <section id="faq" className="border-t border-white/8 bg-white/[.02] py-24">
      <div className="mx-auto max-w-3xl px-5">
        <h2 className="rise text-3xl font-bold md:text-4xl">Pertanyaan umum</h2>
        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="rise card p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {f.q}
                <span className="chev inline-block transition">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="#9a9ab0" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaGlow({ supportUrl }: { supportUrl: string }) {
  return (
    <section className="relative overflow-hidden py-24">
      <div
        className="glow"
        style={{
          width: 600,
          height: 380,
          background: "#7c5cff",
          left: "50%",
          transform: "translateX(-50%)",
          top: 20,
          opacity: 0.32,
        }}
      />
      <div className="relative mx-auto max-w-3xl px-5 text-center">
        <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">
          Siap naik <span className="grad">rank</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-white/55">
          Top up sekarang, item masuk sebelum lobby-mu selesai loading.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#games" className="btn rounded-2xl px-7 py-4 font-semibold text-white">
            Top Up Sekarang
          </a>
          <a
            href={supportUrl}
            className="rounded-2xl border border-white/15 px-7 py-4 font-semibold text-white/85 hover:bg-white/5"
          >
            Chat CS
          </a>
        </div>
      </div>
    </section>
  );
}

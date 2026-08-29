export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-5">
        <nav className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/50 px-4 py-3 backdrop-blur-xl">
          <a href="#" className="flex items-center gap-2.5">
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden="true">
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
            <span className="dis text-[20px] font-extrabold tracking-tight">ZORIVOR</span>
          </a>
          <div className="mx-6 hidden flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 md:flex">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="6.5" stroke="#9a9ab0" strokeWidth="1.8" />
              <path d="m16 16 4 4" stroke="#9a9ab0" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="text-sm text-white/35">Cari game atau voucher…</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/transactions"
              className="rounded-xl border border-white/12 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
            >
              Cek Pesanan
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/8 py-12">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div>
            <div className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="lgf" x1="0" y1="0" x2="48" y2="48">
                    <stop stopColor="#7C5CFF" />
                    <stop offset=".55" stopColor="#5B8CFF" />
                    <stop offset="1" stopColor="#22E1C4" />
                  </linearGradient>
                </defs>
                <rect x="1.5" y="1.5" width="45" height="45" rx="14" stroke="url(#lgf)" strokeWidth="3" />
                <path d="M15 16h18L19 32h14" stroke="url(#lgf)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="dis text-lg font-extrabold">ZORIVOR</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-white/45">
              Platform top up game instan dengan harga final termurah di Indonesia.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <div className="mb-3 font-semibold">Produk</div>
              <ul className="space-y-2 text-white/50">
                <li><a href="#games" className="hover:text-white">Top Up Game</a></li>
                <li><a href="#games" className="hover:text-white">Pulsa &amp; Data</a></li>
                <li><a href="#games" className="hover:text-white">Voucher</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-3 font-semibold">Bantuan</div>
              <ul className="space-y-2 text-white/50">
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                <li><a href="#cara" className="hover:text-white">Cara Order</a></li>
                <li><a href="mailto:support@zorivor.net" className="hover:text-white">Hubungi CS</a></li>
              </ul>
            </div>
            <div>
              <div className="mb-3 font-semibold">Legal</div>
              <ul className="space-y-2 text-white/50">
                <li><a href="#" className="hover:text-white">Syarat &amp; Ketentuan</a></li>
                <li><a href="#" className="hover:text-white">Kebijakan Privasi</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/8 pt-6 text-xs text-white/35">
          © 2026 Zorivor. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-black/85 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4 text-[10px] text-white/55">
        <a href="#" className="flex flex-col items-center gap-1 py-2.5 text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z" stroke="#7C5CFF" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
          Beranda
        </a>
        <a href="#games" className="flex flex-col items-center gap-1 py-2.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M7 8h10l2 8H5l2-8Z" stroke="#9a9ab0" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
          Top Up
        </a>
        <a href="#faq" className="flex flex-col items-center gap-1 py-2.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="3" stroke="#9a9ab0" strokeWidth="1.7" />
          </svg>
          Transaksi
        </a>
        <a href="#" className="flex flex-col items-center gap-1 py-2.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.4" stroke="#9a9ab0" strokeWidth="1.7" />
            <path d="M5 20c1.3-3.4 4-5 7-5s5.7 1.6 7 5" stroke="#9a9ab0" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          Akun
        </a>
      </div>
    </nav>
  );
}

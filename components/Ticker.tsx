function Item({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3 4 6.5V12c0 4.6 3.3 7.8 8 9 4.7-1.2 8-4.4 8-9V6.5L12 3Z"
          stroke="#22E1C4"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="m9 12 2 2 4-4"
          stroke="#22E1C4"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </span>
  );
}

const items = [
  "Garansi Uang Kembali",
  "Supply Resmi & Terpercaya",
  "Layanan 24 Jam Nonstop",
  "Proses Otomatis 9 Detik",
  "Tanpa Biaya Admin",
  "Cashback Setiap Transaksi",
  "CS Responsif 24/7",
  "Ribuan Game Tersedia",
];

export function Ticker() {
  return (
    <section className="mt-8 border-y border-white/8 bg-white/[.03] py-3.5 overflow-hidden">
      <div className="marq text-[13px] font-medium tracking-wide text-white/55">
        {items.map((t, i) => (
          <Item key={i}>{t}</Item>
        ))}
        {items.map((t, i) => (
          <Item key={`b-${i}`}>{t}</Item>
        ))}
      </div>
    </section>
  );
}

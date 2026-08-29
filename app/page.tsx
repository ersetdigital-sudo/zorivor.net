import { Nav, Footer, MobileBottomNav } from "@/components/Nav";
import { HeroBanner } from "@/components/HeroBanner";
import { Ticker } from "@/components/Ticker";
import { Products } from "@/components/Products";
import {
  PaymentMethods,
  HowItWorks,
  Why,
  FAQ,
  CtaGlow,
} from "@/components/Sections";
import { Reveal } from "@/components/Reveal";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings, waMeUrl } from "@/lib/site-settings";
import { GameListSchema, FAQSchema } from "@/components/SeoSchemas";

export const dynamic = "force-dynamic";

const DEFAULT_GRADIENTS = [
  "#140b22,#5b8cff",
  "#1a0b2e,#7c5cff",
  "#1a0f07,#f97316",
  "#12161c,#0ea5e9",
  "#12161c,#a78bfa",
];

const GAME_FAQS = [
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

const WA_LINK = waMeUrl(
  process.env.SUPPORT_WHATSAPP ?? "6281234567890"
);

export default async function Home() {
  const supabase = await createClient();
  const { data: games } = await supabase
    .from("games")
    .select("id,name,publisher,category,cover_url,is_popular,is_hot")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const dynamicCards = (games ?? []).map((g, i) => ({
    id: g.id,
    name: g.name,
    publisher: g.publisher ?? "",
    category: g.category,
    cover: g.cover_url,
    bg: DEFAULT_GRADIENTS[i % DEFAULT_GRADIENTS.length],
    is_popular: g.is_popular ?? false,
    is_hot: g.is_hot ?? false,
  }));

  const settings = await getSiteSettings(["support_whatsapp"] as const);
  const supportUrl = waMeUrl(settings.support_whatsapp);

  return (
    <>
      <GameListSchema games={dynamicCards} />
      <FAQSchema faqs={GAME_FAQS} />
      <Nav />
      <HeroBanner />
      <Ticker />
      <Products dynamicCards={dynamicCards} />
      <PaymentMethods />
      <HowItWorks />
      <Why />
      <FAQ />
      <CtaGlow supportUrl={supportUrl} />
      <Footer />
      <MobileBottomNav />
      <Reveal />
    </>
  );
}

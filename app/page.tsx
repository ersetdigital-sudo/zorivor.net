import { Nav, Footer, MobileBottomNav } from "@/components/Nav";
import { HeroBanner } from "@/components/HeroBanner";
import { Ticker } from "@/components/Ticker";
import { Products } from "@/components/Products";
import {
  CashbackBanner,
  PaymentMethods,
  HowItWorks,
  Why,
  FAQ,
  CtaGlow,
} from "@/components/Sections";
import { Reveal } from "@/components/Reveal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DEFAULT_GRADIENTS = [
  "#140b22,#5b8cff",
  "#1a0b2e,#7c5cff",
  "#1a0f07,#f97316",
  "#12161c,#0ea5e9",
  "#12161c,#a78bfa",
];

export default async function Home() {
  const supabase = await createClient();
  const { data: games } = await supabase
    .from("games")
    .select("id,name,publisher,category,cover_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const dynamicCards = (games ?? []).map((g, i) => ({
    id: g.id,
    name: g.name,
    publisher: g.publisher ?? "",
    category: g.category,
    cover: g.cover_url,
    bg: DEFAULT_GRADIENTS[i % DEFAULT_GRADIENTS.length],
  }));

  return (
    <>
      <Nav />
      <HeroBanner />
      <Ticker />
      <Products dynamicCards={dynamicCards} />
      <CashbackBanner />
      <PaymentMethods />
      <HowItWorks />
      <Why />
      <FAQ />
      <CtaGlow />
      <Footer />
      <MobileBottomNav />
      <Reveal />
    </>
  );
}

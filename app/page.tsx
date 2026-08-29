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

export default function Home() {
  return (
    <>
      <Nav />
      <HeroBanner />
      <Ticker />
      <Products />
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

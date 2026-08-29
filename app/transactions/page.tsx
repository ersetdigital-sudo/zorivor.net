import { getSiteSettings, waMeUrl } from "@/lib/site-settings";
import TransactionsClient from "./TransactionsClient";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const settings = await getSiteSettings(["support_whatsapp"] as const);
  const supportUrl = waMeUrl(settings.support_whatsapp);
  return <TransactionsClient supportUrl={supportUrl} />;
}
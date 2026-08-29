import { createClient } from "@/lib/supabase/server";
import TopupForm, { type TopupPageProps } from "./TopupForm";

export const dynamic = "force-dynamic";

export default async function TopupPage() {
  const supabase = await createClient();

  const [methodsRes, qrisRes, productsRes] = await Promise.all([
    supabase
      .from("payment_methods")
      .select("id,code,label,group_label,fee_idr,sub_label,is_enabled,sort_order,icon_color")
      .eq("is_enabled", true)
      .order("sort_order"),
    supabase
      .from("qris_uploads")
      .select("id,label,cloudinary_url")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("products")
      .select("id,slug,game,category,denomination,price_idr,cashback_pct,is_active")
      .eq("is_active", true)
      .eq("game", "Mobile Legends")
      .order("sort_order", { ascending: true }),
  ]);

  const grouped: Record<string, NonNullable<typeof methodsRes.data>> = {};
  for (const m of methodsRes.data ?? []) {
    if (!grouped[m.group_label]) grouped[m.group_label] = [];
    grouped[m.group_label]!.push(m);
  }

  const paymentGroups: TopupPageProps["paymentGroups"] = Object.entries(
    grouped
  ).map(([name, items]) => ({ name, items }));

  const products = (productsRes.data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    label: p.denomination,
    price: Number(p.price_idr),
    category: (p.category === "Paket" ? "paket" : "diamond") as "paket" | "diamond",
  }));

  return (
    <TopupForm
      paymentGroups={paymentGroups}
      qrisUrl={qrisRes.data?.[0]?.cloudinary_url ?? null}
      products={products}
    />
  );
}
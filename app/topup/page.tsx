import { createClient } from "@/lib/supabase/server";
import TopupForm, { type TopupPageProps } from "./TopupForm";

export const dynamic = "force-dynamic";

export default async function TopupPage() {
  const supabase = await createClient();

  const [methodsRes, qrisRes] = await Promise.all([
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
  ]);

  const grouped: Record<string, NonNullable<typeof methodsRes.data>> = {};
  for (const m of methodsRes.data ?? []) {
    if (!grouped[m.group_label]) grouped[m.group_label] = [];
    grouped[m.group_label]!.push(m);
  }

  const paymentGroups: TopupPageProps["paymentGroups"] = Object.entries(
    grouped
  ).map(([name, items]) => ({ name, items }));

  return (
    <TopupForm
      paymentGroups={paymentGroups}
      qrisUrl={qrisRes.data?.[0]?.cloudinary_url ?? null}
    />
  );
}
import { createClient } from "@/lib/supabase/server";
import TopupForm, { type TopupPageProps } from "./TopupForm";

export const dynamic = "force-dynamic";

export default async function TopupPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>;
}) {
  const supabase = await createClient();
  const { game: gameParam } = await searchParams;

  const [methodsRes, qrisRes, gamesRes] = await Promise.all([
    supabase
      .from("payment_methods")
      .select(
        "id,code,label,group_label,fee_idr,sub_label,is_enabled,sort_order,icon_color,image_url"
      )
      .eq("is_enabled", true)
      .order("sort_order"),
    supabase
      .from("qris_uploads")
      .select("id,label,cloudinary_url")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("games")
      .select("id,slug,name,publisher,cover_url,description,is_active,sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  // Determine which game to show
  let selectedGameId: string | null = null;
  if (gameParam) {
    // Try by id first, then by slug
    const found =
      gamesRes.data?.find((g) => g.id === gameParam) ||
      gamesRes.data?.find((g) => g.slug === gameParam);
    if (found) selectedGameId = found.id;
  }

  // Default: pick first active game
  if (!selectedGameId && gamesRes.data && gamesRes.data.length > 0) {
    selectedGameId = gamesRes.data[0].id;
  }

  const selectedGame = gamesRes.data?.find((g) => g.id === selectedGameId) ?? null;

  // Fetch products for selected game
  const productsRes = selectedGameId
    ? await supabase
        .from("products")
        .select("id,slug,game,category,denomination,price_idr,cashback_pct,is_active")
        .eq("is_active", true)
        .eq("game_id", selectedGameId)
        .order("sort_order", { ascending: true })
    : { data: [] };

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
      games={(gamesRes.data ?? []) as never}
      selectedGameId={selectedGameId}
      selectedGame={selectedGame as never}
    />
  );
}
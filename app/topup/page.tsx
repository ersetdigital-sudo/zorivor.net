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

  const [methodsRes, gamesRes] = await Promise.all([
    supabase
      .from("payment_methods")
      .select(
        "id,code,label,group_label,fee_idr,sub_label,is_enabled,sort_order,icon_color,image_url"
      )
      .eq("is_enabled", true)
      .order("sort_order"),
    supabase
      .from("games")
      .select("id,slug,name,publisher,cover_url,description,is_active,sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  // Determine which game to show
  let selectedGameId: string | null = null;
  if (gameParam) {
    const found =
      gamesRes.data?.find((g) => g.id === gameParam) ||
      gamesRes.data?.find((g) => g.slug === gameParam);
    if (found) selectedGameId = found.id;
  }

  // Default: pick first active game
  if (!selectedGameId && gamesRes.data && gamesRes.data.length > 0) {
    selectedGameId = gamesRes.data[0].id;
  }

  // Safety net: if selectedGameId is set but doesn't correspond to any
  // active game (stale URL, invalid UUID, etc), fall back to first.
  if (
    selectedGameId &&
    gamesRes.data &&
    !gamesRes.data.some((g) => g.id === selectedGameId)
  ) {
    selectedGameId = gamesRes.data[0]?.id ?? null;
  }

  const selectedGame = gamesRes.data?.find((g) => g.id === selectedGameId) ?? null;

  // Fetch products for selected game — guard against non-UUID strings
  // (e.g. a slug that resolved to nothing, or arbitrary ?game=foo).
  const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const productsRes =
    selectedGameId && uuidLike.test(selectedGameId)
      ? await supabase
          .from("products")
          .select(
            "id,slug,game,category,denomination,price_idr,cashback_pct,is_active"
          )
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
      products={products}
      games={(gamesRes.data ?? []) as never}
      selectedGameId={selectedGameId}
      selectedGame={selectedGame as never}
    />
  );
}
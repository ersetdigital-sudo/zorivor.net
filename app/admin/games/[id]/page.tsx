import { createClient } from "@/lib/supabase/server";
import { signUploadParams } from "@/lib/cloudinary";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GameProductsSection } from "./GameProductsSection";

export const dynamic = "force-dynamic";

export default async function AdminGameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [gameRes, productsRes] = await Promise.all([
    supabase
      .from("games")
      .select("id,slug,name,publisher,category,cover_url,description,is_active")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("products")
      .select(
        "id,slug,game_id,game,category,denomination,price_idr,base_price_idr,cashback_pct,stock,is_active,sort_order,icon_url"
      )
      .eq("game_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  if (!gameRes.data) notFound();

  let signParams:
    | { cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string }
    | null = null;
  let cloudinaryError: string | null = null;
  try {
    const signed = await signUploadParams("games");
    signParams = {
      cloudName: signed.cloudName ?? "",
      apiKey: signed.apiKey ?? "",
      timestamp: signed.timestamp,
      signature: signed.signature,
      folder: signed.folder,
    };
  } catch (e) {
    cloudinaryError = (e as Error).message;
  }

  return (
    <>
      <div className="space-y-6">
        <Link
          href="/admin/games"
          className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white"
        >
          ← Kembali ke Games
        </Link>

        <div className="flex items-start gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
            {gameRes.data.cover_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={gameRes.data.cover_url}
                alt={gameRes.data.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-white/30">
                🎮
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{gameRes.data.name}</h1>
            <div className="text-sm text-white/60">
              {gameRes.data.publisher ?? "—"} · {gameRes.data.category}
            </div>
            <div className="font-mono text-xs text-white/40">
              {gameRes.data.slug}
            </div>
            {gameRes.data.description && (
              <div className="mt-2 max-w-xl text-sm text-white/70">
                {gameRes.data.description}
              </div>
            )}
          </div>
        </div>

        {cloudinaryError && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            Cloudinary belum dikonfigurasi: {cloudinaryError}
          </div>
        )}

        <GameProductsSection
          game={gameRes.data}
          products={(productsRes.data ?? []) as never}
          cloudinaryError={cloudinaryError}
        />
      </div>
    </>
  );
}
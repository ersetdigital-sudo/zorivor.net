import { createClient } from "@/lib/supabase/server";
import { signUploadParams } from "@/lib/cloudinary";
import { GamesTable } from "./GamesTable";

export const dynamic = "force-dynamic";

export default async function AdminGamesPage() {
  const supabase = await createClient();

  const { data: games } = await supabase
    .from("games")
    .select("id,slug,name,publisher,category,cover_url,is_active,sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Games</h1>
            <p className="mt-1 text-sm text-white/60">
              Cover image: <b>512×512</b> (1:1, max 2 MB, PNG/JPG/WebP).
              Disimpan di Cloudinary folder <code className="rounded bg-black/30 px-1">games/</code>.
            </p>
          </div>
          <div className="text-xs text-white/50">
            {games?.length ?? 0} game terdaftar
          </div>
        </div>

        {cloudinaryError && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            Cloudinary belum dikonfigurasi: {cloudinaryError}
          </div>
        )}

        <GamesTable
          games={(games ?? []) as never}
          signParams={signParams}
        />
      </div>
    </>
  );
}
import { createClient } from "@/lib/supabase/server";
import { WhatsAppSetting } from "./WhatsAppSetting";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("site_settings")
    .select("value,updated_at")
    .eq("key", "support_whatsapp")
    .maybeSingle();

  const wa = typeof row?.value === "string" ? row.value : "";
  const updatedAt = row?.updated_at ?? null;

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Pengaturan</h1>
          <p className="text-sm text-white/60">
            Nomor WhatsApp CS. Dipakai di tombol/link WhatsApp di seluruh
            website. Perubahan auto-tersimpan dan langsung berlaku.
          </p>
        </div>

        <WhatsAppSetting initial={wa} updatedAt={updatedAt} />
      </div>
    </>
  );
}
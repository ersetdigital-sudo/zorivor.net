import { createClient } from "@/lib/supabase/server";
import { SettingsEditor } from "./SettingsEditor";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("key,value,updated_at")
    .order("key", { ascending: true });

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Pengaturan</h1>
          <p className="text-sm text-white/60">
            No WhatsApp & info situs. Perubahan langsung tersimpan dan
            otomatis dipakai di seluruh website.
          </p>
        </div>

        <SettingsEditor settings={(settings ?? []) as never} />
      </div>
    </>
  );
}
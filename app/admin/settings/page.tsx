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
          <h1 className="text-2xl font-semibold">Pengaturan Situs</h1>
          <p className="text-sm text-white/60">
            Disimpan sebagai key-value JSON di tabel{" "}
            <code className="rounded bg-white/5 px-1">site_settings</code>.
            Edit langsung di sini — perubahan langsung tersimpan.
          </p>
        </div>

        <SettingsEditor settings={(settings ?? []) as never} />
      </div>
    </>
  );
}
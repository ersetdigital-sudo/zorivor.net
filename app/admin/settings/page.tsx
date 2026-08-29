import { createClient } from "@/lib/supabase/server";

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
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {(settings ?? []).map((s) => (
            <div
              key={s.key}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="font-mono text-xs uppercase tracking-wide text-white/60">
                  {s.key}
                </div>
                <div className="text-[10px] text-white/40">
                  {new Date(s.updated_at).toLocaleString("id-ID")}
                </div>
              </div>
              <pre className="overflow-auto rounded-lg border border-white/5 bg-black/40 p-3 text-xs text-white/90">
                {JSON.stringify(s.value, null, 2)}
              </pre>
            </div>
          ))}
          {(!settings || settings.length === 0) && (
            <div className="col-span-full rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/60">
              Belum ada setting
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-violet-400/20 bg-violet-500/5 p-5">
          <h2 className="font-semibold">Cara menambah setting baru</h2>
          <p className="mt-1 text-sm text-white/70">
            Jalankan SQL ini di Supabase SQL Editor (atau panggil API
            <code className="mx-1 rounded bg-black/30 px-1">
              POST /rest/v1/site_settings
            </code>
            dari service role):
          </p>
          <pre className="mt-3 overflow-auto rounded-lg border border-white/5 bg-black/40 p-3 text-xs text-white/90">
{`insert into public.site_settings (key, value) values
  ('cashback_max_idr', '50000'::jsonb),
  ('maintenance_mode', 'false'::jsonb)
on conflict (key) do update set value = excluded.value;`}
          </pre>
        </div>
      </div>
    </>
  );
}
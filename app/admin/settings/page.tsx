import { createClient } from "@/lib/supabase/server";
import { WhatsAppSetting } from "./WhatsAppSetting";
import { AdminsManager } from "./AdminsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  // Current admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // WhatsApp setting
  const { data: row } = await supabase
    .from("site_settings")
    .select("value,updated_at")
    .eq("key", "support_whatsapp")
    .maybeSingle();
  const wa = typeof row?.value === "string" ? row.value : "";
  const updatedAt = row?.updated_at ?? null;

  // Admin list — use service role to read auth.users metadata
  // (last_sign_in_at, user_metadata). Falls back to RLS-only view
  // if service role is not configured.
  const { createServiceClient } = await import("@/lib/supabase/server");
  let admins: Array<{
    user_id: string;
    email: string;
    is_super_admin: boolean;
    created_at: string;
    last_sign_in_at: string | null;
    display_name: string | null;
  }> = [];

  try {
    const service = await createServiceClient();
    const [{ data: roles }, { data: list }] = await Promise.all([
      supabase
        .from("admin_roles")
        .select("user_id,email,is_super_admin,created_at")
        .order("created_at", { ascending: true }),
      service.auth.admin.listUsers({ perPage: 100 }),
    ]);
    const byId = new Map(list.users.map((u) => [u.id, u]));
    admins = (roles ?? []).map((r) => {
      const u = byId.get(r.user_id);
      return {
        user_id: r.user_id,
        email: r.email,
        is_super_admin: r.is_super_admin,
        created_at: r.created_at,
        last_sign_in_at: u?.last_sign_in_at ?? null,
        display_name:
          (u?.user_metadata?.display_name as string | undefined) ?? null,
      };
    });
  } catch (e) {
    // service role not configured — show empty list gracefully
    admins = [];
  }

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Pengaturan</h1>
          <p className="text-sm text-white/60">
            Konfigurasi situs dan akun admin. Perubahan langsung tersimpan
            dan berlaku di seluruh website.
          </p>
        </div>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              Komunikasi
            </h2>
          </div>
          <WhatsAppSetting initial={wa} updatedAt={updatedAt} />
        </section>

        <section className="space-y-3">
          <AdminsManager
            initialAdmins={admins}
            currentUserId={user?.id ?? ""}
          />
        </section>
      </div>
    </>
  );
}
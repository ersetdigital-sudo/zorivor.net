import { createClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  email: string;
  is_super_admin: boolean;
};

export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: role } = await supabase
    .from("admin_roles")
    .select("user_id,email,is_super_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!role) return null;
  return {
    id: role.user_id,
    email: role.email,
    is_super_admin: role.is_super_admin ?? false,
  };
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}
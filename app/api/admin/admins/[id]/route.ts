import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function guard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauth", status: 401 };
  const { data: role } = await supabase
    .from("admin_roles")
    .select("user_id,is_super_admin")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!role) return { error: "Forbidden", status: 403 };
  return { supabase, currentUser: user };
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guardRes = await guard();
  if ("error" in guardRes) {
    return NextResponse.json({ error: guardRes.error }, { status: guardRes.status });
  }
  const { id: targetId } = await params;

  if (targetId === guardRes.currentUser.id) {
    return NextResponse.json(
      { error: "Tidak bisa menghapus akun sendiri" },
      { status: 400 }
    );
  }

  // Check last-admin constraint
  const { count, error: countErr } = await guardRes.supabase
    .from("admin_roles")
    .select("user_id", { count: "exact", head: true });
  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 400 });
  }
  if ((count ?? 0) <= 1) {
    return NextResponse.json(
      { error: "Sistem harus punya minimal 1 admin" },
      { status: 400 }
    );
  }

  // Delete from admin_roles first (CASCADE will not run because we want
  // explicit order; auth user can stay if you want to soft-remove).
  // For "real" removal, also delete the auth user.
  const { error: roleErr } = await guardRes.supabase
    .from("admin_roles")
    .delete()
    .eq("user_id", targetId);
  if (roleErr) {
    return NextResponse.json({ error: roleErr.message }, { status: 400 });
  }

  const { createServiceClient } = await import("@/lib/supabase/server");
  const service = await createServiceClient();
  await service.auth.admin.deleteUser(targetId).catch(() => {
    // ignore — the role is already gone
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guardRes = await guard();
  if ("error" in guardRes) {
    return NextResponse.json({ error: guardRes.error }, { status: guardRes.status });
  }
  const { id: targetId } = await params;
  const body = await req.json();

  const newPassword = body.password ? String(body.password) : null;
  const currentPassword = body.currentPassword
    ? String(body.currentPassword)
    : null;

  if (!newPassword) {
    return NextResponse.json(
      { error: "Password baru wajib diisi" },
      { status: 400 }
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password baru minimal 8 karakter" },
      { status: 400 }
    );
  }

  // If changing OWN password, require current password as confirmation.
  if (targetId === guardRes.currentUser.id) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Password lama wajib diisi untuk mengganti password sendiri" },
        { status: 400 }
      );
    }
    // Verify the current password by signing in with it
    const { createServiceClient } = await import("@/lib/supabase/server");
    const service = await createServiceClient();
    const { error: signInErr } =
      await service.auth.signInWithPassword({
        email: guardRes.currentUser.email!,
        password: currentPassword,
      });
    if (signInErr) {
      return NextResponse.json(
        { error: "Password lama salah" },
        { status: 400 }
      );
    }
  }

  const { createServiceClient } = await import("@/lib/supabase/server");
  const service = await createServiceClient();
  const { error: updErr } = await service.auth.admin.updateUserById(
    targetId,
    { password: newPassword }
  );
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
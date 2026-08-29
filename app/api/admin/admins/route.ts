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
  return { supabase, user };
}

export async function GET() {
  const guardRes = await guard();
  if ("error" in guardRes) {
    return NextResponse.json({ error: guardRes.error }, { status: guardRes.status });
  }

  // Service-role client needed to read auth.users metadata (last_sign_in_at).
  const { createServiceClient } = await import("@/lib/supabase/server");
  const service = await createServiceClient();

  const [{ data: roles, error: rolesErr }, { data: list, error: usersErr }] =
    await Promise.all([
      guardRes.supabase
        .from("admin_roles")
        .select("user_id,email,is_super_admin,created_at")
        .order("created_at", { ascending: true }),
      service.auth.admin.listUsers({ perPage: 100 }),
    ]);

  if (rolesErr) return NextResponse.json({ error: rolesErr.message }, { status: 400 });
  if (usersErr) return NextResponse.json({ error: usersErr.message }, { status: 400 });

  const byId = new Map(list.users.map((u) => [u.id, u]));
  const out = (roles ?? []).map((r) => {
    const u = byId.get(r.user_id);
    return {
      user_id: r.user_id,
      email: r.email,
      is_super_admin: r.is_super_admin,
      created_at: r.created_at,
      last_sign_in_at: u?.last_sign_in_at ?? null,
      // Supabase auth exposes `user_metadata` (set on signup) and
      // app_metadata. We don't store a display name anywhere; keep null
      // for now and let admin UI show email as the name fallback.
      display_name:
        (u?.user_metadata?.display_name as string | undefined) ?? null,
    };
  });

  return NextResponse.json({ admins: out });
}

export async function POST(req: Request) {
  const guardRes = await guard();
  if ("error" in guardRes) {
    return NextResponse.json({ error: guardRes.error }, { status: guardRes.status });
  }

  const body = await req.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = body.name ? String(body.name).trim() : null;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email dan password wajib diisi" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password minimal 8 karakter" },
      { status: 400 }
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: "Format email tidak valid" },
      { status: 400 }
    );
  }

  const { createServiceClient } = await import("@/lib/supabase/server");
  const service = await createServiceClient();

  // Pre-check duplicate email in admin_roles to give a clean error
  const { data: existing } = await guardRes.supabase
    .from("admin_roles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "Email ini sudah terdaftar sebagai admin" },
      { status: 409 }
    );
  }

  // Create the auth user
  const { data: created, error: createErr } =
    await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: name ?? email.split("@")[0] },
    });
  if (createErr || !created.user) {
    return NextResponse.json(
      { error: createErr?.message ?? "Gagal membuat user" },
      { status: 400 }
    );
  }

  // Also reject if Supabase auth already had that email (race / pre-existing)
  const { data: dup } = await guardRes.supabase
    .from("admin_roles")
    .select("user_id")
    .eq("user_id", created.user.id)
    .maybeSingle();
  if (dup) {
    return NextResponse.json(
      { error: "User ini sudah menjadi admin" },
      { status: 409 }
    );
  }

  // Grant admin role
  const { error: roleErr } = await guardRes.supabase.from("admin_roles").insert({
    user_id: created.user.id,
    email,
    is_super_admin: false,
  });
  if (roleErr) {
    // Roll back the created user to avoid orphans
    await service.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: roleErr.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    admin: {
      user_id: created.user.id,
      email,
      is_super_admin: false,
      created_at: created.user.created_at,
      last_sign_in_at: null,
      display_name: name ?? email.split("@")[0],
    },
  });
}
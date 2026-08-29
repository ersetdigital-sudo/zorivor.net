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
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!role) return { error: "Forbidden", status: 403 };
  return { supabase };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const guardRes = await guard();
  if ("error" in guardRes) {
    return NextResponse.json({ error: guardRes.error }, { status: guardRes.status });
  }
  const { key } = await params;
  const body = await req.json();
  if (body.value === undefined) {
    return NextResponse.json({ error: "Missing value" }, { status: 400 });
  }

  const { data, error } = await guardRes.supabase
    .from("site_settings")
    .update({ value: body.value })
    .eq("key", key)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const guardRes = await guard();
  if ("error" in guardRes) {
    return NextResponse.json({ error: guardRes.error }, { status: guardRes.status });
  }
  const { key } = await params;
  const { error } = await guardRes.supabase
    .from("site_settings")
    .delete()
    .eq("key", key);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
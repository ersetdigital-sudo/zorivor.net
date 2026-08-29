import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauth" }, { status: 401 });

  const { data: role } = await supabase
    .from("admin_roles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  if (!body.publicId || !body.url || !body.label) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("qris_uploads")
    .insert({
      label: body.label,
      cloudinary_public_id: body.publicId,
      cloudinary_url: body.url,
      width: body.width ?? null,
      height: body.height ?? null,
      bytes: body.bytes ?? null,
      is_active: true,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, data });
}
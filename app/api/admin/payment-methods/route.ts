import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauth" }, { status: 401 });

  // ensure admin
  const { data: role } = await supabase
    .from("admin_roles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  if (!body.code || !body.label || !body.group_label) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Get max sort_order
  const { data: maxRow } = await supabase
    .from("payment_methods")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (maxRow?.sort_order ?? 0) + 10;

  const { data, error } = await supabase
    .from("payment_methods")
    .insert({
      code: body.code,
      label: body.label,
      group_label: body.group_label,
      fee_idr: body.fee_idr ?? 0,
      sub_label: body.sub_label ?? null,
      icon_color: body.icon_color ?? "#7C5CFF",
      sort_order: sortOrder,
      is_enabled: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, data });
}
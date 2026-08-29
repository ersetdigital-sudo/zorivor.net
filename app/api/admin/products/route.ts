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

export async function POST(req: Request) {
  const guardRes = await guard();
  if ("error" in guardRes) {
    return NextResponse.json({ error: guardRes.error }, { status: guardRes.status });
  }

  const body = await req.json();
  if (!body.slug || !body.game || !body.denomination) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: maxRow } = await guardRes.supabase
    .from("products")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (maxRow?.sort_order ?? 0) + 10;

  const { data, error } = await guardRes.supabase
    .from("products")
    .insert({
      slug: body.slug,
      game_id: body.game_id ?? null,
      game: body.game,
      category: body.category ?? "Diamond",
      denomination: body.denomination,
      price_idr: body.price_idr ?? 0,
      base_price_idr: body.base_price_idr ?? null,
      cashback_pct: body.cashback_pct ?? 0,
      stock: body.stock ?? 999,
      is_active: true,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, data });
}
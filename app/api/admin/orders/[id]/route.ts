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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guardRes = await guard();
  if ("error" in guardRes) {
    return NextResponse.json({ error: guardRes.error }, { status: guardRes.status });
  }
  const { id } = await params;

  // Check existence first (with maybeSingle so 0 rows is not an error).
  // This gives us a clean 404 path before the destructive DELETE.
  const { data: existing, error: lookupErr } = await guardRes.supabase
    .from("orders")
    .select("id,invoice")
    .eq("id", id)
    .maybeSingle();
  if (lookupErr) {
    return NextResponse.json({ error: lookupErr.message }, { status: 400 });
  }
  if (!existing) {
    return NextResponse.json(
      { error: "Pesanan ini sudah tidak ditemukan (mungkin sudah dihapus sebelumnya)." },
      { status: 404 }
    );
  }

  const { data, error } = await guardRes.supabase
    .from("orders")
    .delete()
    .eq("id", id)
    .select("invoice")
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    // Shouldn't happen (we just verified existence), but if a race deletes
    // the row between lookup and delete, return a clean 404.
    return NextResponse.json(
      { error: "Pesanan ini sudah tidak ditemukan (mungkin sudah dihapus sebelumnya)." },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true, deleted: data.invoice });
}
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

  // Lookup the order to confirm it exists and to return its invoice
  // in the success payload. Uses the user's session client (respects RLS).
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

  // Use service role for the actual DELETE so RLS doesn't silently
  // block it (admin auth was already validated by guard() above).
  const { createServiceClient } = await import("@/lib/supabase/server");
  const service = await createServiceClient();

  const { error: delErr } = await service
    .from("orders")
    .delete()
    .eq("id", id);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, deleted: existing.invoice });
}

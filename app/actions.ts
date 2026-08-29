"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type CreateOrderInput = {
  product_slug: string;
  game_user_id: string;
  game_server_id?: string;
  whatsapp?: string;
  payment_method: string;
};

export type CreateOrderResult = {
  ok: boolean;
  invoice?: string;
  amount_idr?: number;
  cashback_idr?: number;
  error?: string;
};

function genInvoice() {
  const ts = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ZRV-${ts}-${rand}`;
}

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  if (!input.product_slug || !input.game_user_id || !input.payment_method) {
    return { ok: false, error: "Data tidak lengkap" };
  }

  const supabase = await createClient();

  const { data: product, error: pErr } = await supabase
    .from("products")
    .select(
      "id,slug,game,denomination,price_idr,cashback_pct,is_active,stock"
    )
    .eq("slug", input.product_slug)
    .eq("is_active", true)
    .maybeSingle();

  if (pErr) return { ok: false, error: pErr.message };
  if (!product)
    return { ok: false, error: "Produk tidak ditemukan / tidak aktif" };

  const cashback = Math.round(
    (Number(product.price_idr) * Number(product.cashback_pct ?? 0)) / 100
  );

  const invoice = genInvoice();

  const { error } = await supabase.from("orders").insert({
    invoice,
    product_id: product.id,
    game: product.game,
    denomination: product.denomination,
    game_user_id: input.game_user_id.trim(),
    game_server_id: input.game_server_id?.trim() || null,
    whatsapp: input.whatsapp?.trim() || null,
    payment_method: input.payment_method,
    amount_idr: product.price_idr,
    cashback_idr: cashback,
    status: "pending",
  });

  if (error) return { ok: false, error: error.message };

  return {
    ok: true,
    invoice,
    amount_idr: product.price_idr,
    cashback_idr: cashback,
  };
}

export async function createOrderAndRedirect(formData: FormData) {
  const slug = String(formData.get("product_slug") ?? "");
  const user_id = String(formData.get("game_user_id") ?? "");
  const server_id = String(formData.get("game_server_id") ?? "");
  const whatsapp = String(formData.get("whatsapp") ?? "");
  const pay = String(formData.get("payment_method") ?? "");

  const result = await createOrder({
    product_slug: slug,
    game_user_id: user_id,
    game_server_id: server_id,
    whatsapp,
    payment_method: pay,
  });

  if (!result.ok || !result.invoice) {
    redirect(`/topup?error=${encodeURIComponent(result.error ?? "Gagal")}`);
  }

  redirect(`/topup/success?invoice=${result.invoice}`);
}

export async function lookupOrder(invoice: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "invoice,game,denomination,amount_idr,cashback_idr,status,created_at,payment_method"
    )
    .eq("invoice", invoice)
    .maybeSingle();
  return data;
}
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Order, OrderStatus, Product } from "@/lib/types";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  notes?: string
): Promise<Order | null> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status };
  if (status === "paid" && !notes) updates.paid_at = new Date().toISOString();
  if (status === "success") updates.completed_at = new Date().toISOString();
  if (typeof notes === "string") updates.notes = notes;

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select(
      "id,invoice,game,denomination,game_user_id,whatsapp,payment_method,amount_idr,cashback_idr,status,created_at,notes"
    )
    .maybeSingle();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return (data as Order | null) ?? null;
}

export async function upsertProduct(product: Partial<Product> & { id?: string }) {
  const supabase = await createClient();
  if (product.id) {
    const { error } = await supabase
      .from("products")
      .update(product)
      .eq("id", product.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("products").insert(product);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function toggleProductActive(id: string, is_active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
}
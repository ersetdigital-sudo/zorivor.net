import { createClient } from "@/lib/supabase/server";
import { ProductRow } from "./ProductRow";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select(
      "id,slug,game,category,denomination,price_idr,base_price_idr,cashback_pct,stock,is_active,sort_order"
    )
    .order("sort_order", { ascending: true })
    .order("game", { ascending: true });

  const list = (products as Product[] | null) ?? [];

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Produk</h1>
          <div className="text-xs text-white/50">
            {list.length} produk terdaftar
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase text-white/50">
              <tr>
                <th className="px-3 py-2">Game / Item</th>
                <th className="px-3 py-2">Harga Jual</th>
                <th className="px-3 py-2">Cashback</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <ProductRow key={p.id} product={p} />
              ))}
              {list.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-white/50"
                  >
                    Belum ada produk
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
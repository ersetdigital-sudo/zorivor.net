import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://zorivor.net";
  const supabase = await createClient();

  const [{ data: games }, { data: products }] = await Promise.all([
    supabase
      .from("games")
      .select("id,slug,name,updated_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id,slug,game,updated_at")
      .eq("is_active", true)
      .limit(500),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/topup`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/transactions`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
  ];

  const gameEntries: MetadataRoute.Sitemap = (games ?? []).map((g) => ({
    url: `${base}/topup?game=${g.slug}`,
    lastModified: g.updated_at ? new Date(g.updated_at) : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const productEntries: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${base}/topup?game=${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...gameEntries, ...productEntries];
}

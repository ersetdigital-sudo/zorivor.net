import { createClient } from "@/lib/supabase/server";

const DEFAULTS: Record<string, string> = {
  support_whatsapp: "6281234567890",
  site_name: "Zorivor",
  hero_title: "Top Up Game Termurah, Tanpa Biaya Admin",
};

/**
 * Read a single site_settings key (server-only).
 * Returns the default value if the key isn't set.
 */
export async function getSiteSetting(key: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  const v = data?.value;
  if (typeof v === "string" && v.length > 0) return v;
  return DEFAULTS[key] ?? "";
}

/**
 * Read multiple keys in one query (cheaper than N round-trips).
 */
export async function getSiteSettings<K extends string>(
  keys: readonly K[]
): Promise<Record<K, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", [...keys]);

  const out: Record<string, string> = {};
  for (const k of keys) {
    const row = data?.find((r) => r.key === k);
    const v = row?.value;
    out[k] =
      typeof v === "string" && v.length > 0 ? v : (DEFAULTS[k] ?? "");
  }
  return out as Record<K, string>;
}

/**
 * Build a `https://wa.me/<number>` URL from a stored WhatsApp number.
 * Normalises: strips spaces, +, leading 0 → 62.
 */
export function waMeUrl(num: string | null | undefined): string {
  const cleaned = (num ?? "")
    .replace(/[^\d]/g, "")
    .replace(/^0/, "62");
  if (!cleaned) return "https://wa.me/6281234567890";
  return `https://wa.me/${cleaned}`;
}
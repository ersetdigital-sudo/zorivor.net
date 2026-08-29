import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SUPPORT_WA } from "@/lib/wa";

/**
 * Read a single site_settings key (server-only).
 * Returns the default value if the key isn't set.
 */
export async function getSiteSetting(key: string): Promise<string> {
  if (key === "support_whatsapp") {
    return getSiteSettings(["support_whatsapp"]).then((r) => r.support_whatsapp);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  const v = data?.value;
  return typeof v === "string" && v.length > 0 ? v : "";
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
    if (k === "support_whatsapp") {
      out[k] =
        typeof v === "string" && v.length > 0 ? v : DEFAULT_SUPPORT_WA;
    } else {
      out[k] = typeof v === "string" && v.length > 0 ? v : "";
    }
  }
  return out as Record<K, string>;
}

// re-export waMeUrl for callers that already use this module
export { waMeUrl, DEFAULT_SUPPORT_WA } from "@/lib/wa";
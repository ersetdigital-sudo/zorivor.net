/**
 * Pure WhatsApp URL builder — no DB, safe in client + server.
 * Normalises a stored number to international form:
 *   - strips +, spaces, dashes
 *   - leading 0 → 62
 *   - bare local (e.g. 8123…) → 62xxxxxxxxxx
 */
export function waMeUrl(num: string | null | undefined): string {
  const cleaned = (num ?? "").replace(/\D/g, "");
  if (!cleaned) return "https://wa.me/6281234567890";
  if (cleaned.startsWith("62")) return `https://wa.me/${cleaned}`;
  if (cleaned.startsWith("0")) return `https://wa.me/62${cleaned.slice(1)}`;
  return `https://wa.me/62${cleaned}`;
}

export const DEFAULT_SUPPORT_WA = "6281234567890";
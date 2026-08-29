/**
 * Translates raw backend errors into human-friendly Indonesian messages.
 * Returns the cleaned message (or a generic fallback) for the UI.
 */
export function humaniseError(
  raw: string | null | undefined,
  fallback = "Terjadi kesalahan, silakan coba lagi."
): string {
  if (!raw) return fallback;
  const msg = String(raw).toLowerCase();

  // Supabase / PostgREST common codes
  if (msg.includes("pgrst116") || msg.includes("cannot coerce"))
    return "Data tidak ditemukan atau sudah dihapus.";
  if (msg.includes("duplicate key") || msg.includes("unique constraint"))
    return "Data duplikat — nilai ini sudah ada.";
  if (msg.includes("foreign key") || msg.includes("violates foreign key"))
    return "Data ini masih dipakai di tempat lain dan tidak bisa dihapus.";
  if (msg.includes("not-null") || msg.includes("violates not-null"))
    return "Ada field wajib yang kosong.";
  if (msg.includes("check constraint"))
    return "Data tidak valid (melewati validasi server).";
  if (msg.includes("invalid login") || msg.includes("invalid credentials"))
    return "Email atau password salah.";
  if (msg.includes("email not confirmed"))
    return "Email belum diverifikasi.";
  if (msg.includes("user already registered") || msg.includes("already been registered"))
    return "Email ini sudah terdaftar.";
  if (msg.includes("password should be at least"))
    return "Password minimal 8 karakter.";
  if (msg.includes("jwt") || msg.includes("unauthorized") || msg.includes("401"))
    return "Sesi login habis. Silakan login ulang.";
  if (msg.includes("forbidden") || msg.includes("403"))
    return "Akses ditolak.";
  if (msg.includes("not found") || msg.includes("404") || msg.includes("could not find"))
    return "Data tidak ditemukan.";
  if (msg.includes("rate limit") || msg.includes("too many requests"))
    return "Terlalu banyak permintaan. Coba lagi beberapa saat.";
  if (msg.includes("network") || msg.includes("fetch failed"))
    return "Tidak bisa terhubung ke server. Periksa koneksi Anda.";
  if (msg.includes("cloudinary") || msg.includes("cloud_name"))
    return "Upload Cloudinary gagal. Periksa konfigurasi atau coba lagi.";

  // If message is already short and doesn't look like a stack trace,
  // pass it through (translated upstream by the API route).
  if (raw.length < 120 && !/^error[:\s]/i.test(raw)) return raw;

  return fallback;
}
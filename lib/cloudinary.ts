import { createClient } from "@/lib/supabase/server";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.warn(
    "[cloudinary] missing env vars — admin uploads will fail. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
  );
}

/**
 * Server-side Cloudinary upload via the unsigned preset endpoint.
 * For uploads from the browser we use signed timestamps generated here so
 * the API secret never leaks to the client.
 */
export async function signUploadParams(folder = "qris") {
  const timestamp = Math.floor(Date.now() / 1000);

  if (!API_SECRET) {
    throw new Error(
      "CLOUDINARY_API_SECRET not set — configure it in .env.local or Vercel env vars."
    );
  }
  // Cloudinary signature: HMAC-SHA1("<sorted_params><api_secret>")
  // where api_secret is appended INSIDE the message (not used as HMAC key).
  const params = `folder=${folder}&timestamp=${timestamp}`;
  const message = params + API_SECRET;
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(API_SECRET),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sigBytes = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  const sig = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return {
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    timestamp,
    signature: sig,
    folder,
  };
}

export async function recordQrisUpload(input: {
  label: string;
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  bytes?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  const { error } = await supabase.from("qris_uploads").insert({
    label: input.label,
    cloudinary_public_id: input.publicId,
    cloudinary_url: input.url,
    width: input.width ?? null,
    height: input.height ?? null,
    bytes: input.bytes ?? null,
    is_active: true,
    uploaded_by: user.id,
  });
  if (error) throw new Error(error.message);
}

export async function deactivateQris(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("qris_uploads")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateGameCover(input: {
  gameId: string;
  publicId: string;
  url: string;
}) {
  const supabase = await createClient();
  const { data: role } = await supabase
    .from("admin_roles")
    .select("user_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .maybeSingle();
  if (!role) throw new Error("Forbidden");

  const { error } = await supabase
    .from("games")
    .update({
      cover_public_id: input.publicId,
      cover_url: input.url,
    })
    .eq("id", input.gameId);
  if (error) throw new Error(error.message);
}

export async function updateProductIcon(input: {
  productId: string;
  publicId: string;
  url: string;
}) {
  const supabase = await createClient();
  const { data: role } = await supabase
    .from("admin_roles")
    .select("user_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .maybeSingle();
  if (!role) throw new Error("Forbidden");

  const { error } = await supabase
    .from("products")
    .update({
      icon_public_id: input.publicId,
      icon_url: input.url,
    })
    .eq("id", input.productId);
  if (error) throw new Error(error.message);
}
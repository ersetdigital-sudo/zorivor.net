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
  // Crypto-compatible HMAC-SHA1 signature for cloudinary upload params.
  // Cloudinary string-to-sign = "<sorted_params><api_secret>"
  const params = `folder=${folder}&timestamp=${timestamp}`;
  const sig = await hmacSha1Hex(params + API_SECRET);

  return {
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    timestamp,
    signature: sig,
    folder,
  };
}

async function hmacSha1Hex(message: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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
import { createClient } from "@/lib/supabase/server";
import { signUploadParams } from "@/lib/cloudinary";
import { PaymentMethodsTable } from "./PaymentMethodsTable";
import { QrisUploader } from "./QrisUploader";
import { QrisGallery } from "./QrisGallery";

export const dynamic = "force-dynamic";

export default async function AdminPaymentPage() {
  const supabase = await createClient();

  const [methodsRes, qrisRes] = await Promise.all([
    supabase
      .from("payment_methods")
      .select(
        "id,code,label,group_label,fee_idr,sub_label,is_enabled,sort_order,icon_color"
      )
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true }),
    supabase
      .from("qris_uploads")
      .select(
        "id,label,cloudinary_public_id,cloudinary_url,width,height,bytes,is_active,created_at"
      )
      .order("created_at", { ascending: false }),
  ]);

  let signParams:
    | { cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string }
    | null = null;
  let cloudinaryError: string | null = null;
  try {
    const signed = await signUploadParams("qris");
    signParams = {
      cloudName: signed.cloudName ?? "",
      apiKey: signed.apiKey ?? "",
      timestamp: signed.timestamp,
      signature: signed.signature,
      folder: signed.folder,
    };
  } catch (e) {
    cloudinaryError = (e as Error).message;
  }

  let methodSignParams:
    | { cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string }
    | null = null;
  try {
    const signed = await signUploadParams("payment-methods");
    methodSignParams = {
      cloudName: signed.cloudName ?? "",
      apiKey: signed.apiKey ?? "",
      timestamp: signed.timestamp,
      signature: signed.signature,
      folder: signed.folder,
    };
  } catch {
    // ignore — will fall back to signParams for QRIS context
    methodSignParams = signParams;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Pembayaran</h1>
          <div className="text-xs text-white/50">
            Atur metode pembayaran & QRIS
          </div>
        </div>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">QRIS Image</h2>
            <p className="text-sm text-white/60">
              Upload gambar QRIS ke Cloudinary. QRIS aktif akan ditampilkan di
              halaman top-up saat user pilih metode QRIS.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            {signParams ? (
              <QrisUploader signParams={signParams} />
            ) : (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                Cloudinary belum dikonfigurasi: {cloudinaryError}
              </div>
            )}
          </div>

          <QrisGallery
            items={
              (qrisRes.data ?? []).map((q) => ({
                ...q,
                created_at: q.created_at ?? "",
              })) as never
            }
          />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Metode Pembayaran</h2>
            <p className="text-sm text-white/60">
              Tambah, edit, aktif/nonaktif metode pembayaran. Yang aktif akan
              muncul di halaman top-up.
            </p>
          </div>

          <PaymentMethodsTable
          methods={(methodsRes.data ?? []) as never}
          signParams={methodSignParams}
        />
        </section>
      </div>
    </>
  );
}
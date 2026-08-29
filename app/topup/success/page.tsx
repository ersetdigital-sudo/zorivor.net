import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { SuccessClient } from "./SuccessClient";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ invoice?: string }>;
};

export default async function TopupSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const invoice = params.invoice ?? "";

  if (!invoice) {
    return (
      <Suspense fallback={null}>
        <SuccessClient
          invoice=""
          order={null}
          qrisUrl={null}
          paymentMethodImage={null}
          paymentMethodLabel={null}
        />
      </Suspense>
    );
  }

  const supabase = await createClient();

  const [orderRes, qrisRes] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "invoice,game,denomination,amount_idr,cashback_idr,status,payment_method,game_user_id,game_server_id,created_at"
      )
      .eq("invoice", invoice)
      .maybeSingle(),
    supabase
      .from("qris_uploads")
      .select("cloudinary_url")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  let pmImage: string | null = null;
  let pmLabel: string | null = null;
  if (orderRes.data?.payment_method) {
    const { data: pm } = await supabase
      .from("payment_methods")
      .select("label,image_url")
      .eq("label", orderRes.data.payment_method)
      .maybeSingle();
    pmImage = pm?.image_url ?? null;
    pmLabel = pm?.label ?? null;
  }

  const isQris = orderRes.data?.payment_method === "QRIS";
  const qrisUrl = isQris ? qrisRes.data?.[0]?.cloudinary_url ?? null : null;

  return (
    <Suspense fallback={null}>
      <SuccessClient
        invoice={invoice}
        order={orderRes.data as never}
        qrisUrl={qrisUrl}
        paymentMethodImage={pmImage}
        paymentMethodLabel={pmLabel}
      />
    </Suspense>
  );
}
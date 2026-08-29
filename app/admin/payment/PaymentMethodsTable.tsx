"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconTrash } from "@/components/Icons";
import { ToggleSwitch } from "@/components/ToggleSwitch";

type Method = {
  id: string;
  code: string;
  label: string;
  group_label: string;
  fee_idr: number;
  sub_label: string | null;
  is_enabled: boolean;
  sort_order: number;
  icon_color: string;
  image_url: string | null;
  image_public_id: string | null;
};

type SignParams = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

type RowState = {
  enabled: boolean;
  saving: boolean;
};

type Toast = {
  id: number;
  kind: "error" | "success";
  message: string;
};

const DEBOUNCE_MS = 350;

export function PaymentMethodsTable({
  methods,
  signParams,
}: {
  methods: Method[];
  signParams: SignParams | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);

  const [rowState, setRowState] = useState<Record<string, RowState>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const inflight = useRef<Record<string, AbortController>>({});

  // Initialize / sync rowState when methods list changes
  useEffect(() => {
    setRowState((prev) => {
      const next: Record<string, RowState> = { ...prev };
      for (const m of methods) {
        if (!next[m.id]) {
          next[m.id] = { enabled: m.is_enabled, saving: false };
        } else if (!next[m.id].saving) {
          next[m.id] = { ...next[m.id], enabled: m.is_enabled };
        }
      }
      return next;
    });
  }, [methods]);

  function pushToast(kind: Toast["kind"], message: string) {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4500);
  }

  async function toggle(id: string, next: boolean) {
    setRowState((prev) => ({
      ...prev,
      [id]: { enabled: next, saving: true },
    }));

    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id]);
    }
    if (inflight.current[id]) {
      inflight.current[id].abort();
    }

    debounceTimers.current[id] = setTimeout(async () => {
      const controller = new AbortController();
      inflight.current[id] = controller;

      try {
        const res = await fetch(`/api/admin/payment-methods/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_enabled: next }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }
        setRowState((prev) => ({
          ...prev,
          [id]: { enabled: next, saving: false },
        }));
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setRowState((prev) => ({
          ...prev,
          [id]: { enabled: !next, saving: false },
        }));
        pushToast("error", `Gagal update status: ${e?.message ?? e}`);
      } finally {
        delete inflight.current[id];
      }
    }, DEBOUNCE_MS);
  }

  async function remove(id: string, label: string) {
    if (!confirm(`Hapus metode "${label}"?`)) return;
    await fetch(`/api/admin/payment-methods/${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  const grouped: Record<string, Method[]> = {};
  for (const m of methods) {
    (grouped[m.group_label] ||= []).push(m);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
        >
          <IconPlus /> Tambah Metode
        </button>
      </div>

      {showAdd && (
        <AddMethodForm
          onDone={() => {
            setShowAdd(false);
            startTransition(() => router.refresh());
          }}
        />
      )}

      {Object.entries(grouped).map(([group, list]) => (
        <div
          key={group}
          className="overflow-hidden rounded-2xl border border-white/10"
        >
          <div className="border-b border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/60">
            {group}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-left text-xs text-white/40">
              <tr>
                <th className="px-4 py-2">Label</th>
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Biaya</th>
                <th className="px-4 py-2">Sub</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => {
                const state = rowState[m.id] ?? {
                  enabled: m.is_enabled,
                  saving: false,
                };
                return (
                  <tr key={m.id} className="border-t border-white/5">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ background: m.icon_color }}
                        />
                        <span className="font-medium">{m.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <MethodImageCell method={m} signParams={signParams} />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-white/60">
                      {m.code}
                    </td>
                    <td className="px-4 py-2.5">
                      {m.fee_idr > 0
                        ? `Rp ${m.fee_idr.toLocaleString("id-ID")}`
                        : "Gratis"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-white/60">
                      {m.sub_label ?? "-"}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <ToggleSwitch
                          checked={state.enabled}
                          disabled={state.saving}
                          onChange={(next) => toggle(m.id, next)}
                        />
                        <span
                          className={`text-[10px] uppercase tracking-wider ${
                            state.saving
                              ? "text-white/40"
                              : state.enabled
                              ? "text-emerald-300"
                              : "text-white/40"
                          }`}
                        >
                          {state.saving
                            ? "Saving…"
                            : state.enabled
                            ? "Aktif"
                            : "Off"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => remove(m.id, m.label)}
                        className="rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-300 hover:bg-red-500/20"
                      >
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {methods.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/50">
          Belum ada metode
        </div>
      )}

      <ToastStack toasts={toasts} />
    </div>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto min-w-[260px] max-w-sm rounded-lg border px-3 py-2 text-sm shadow-lg backdrop-blur ${
            t.kind === "error"
              ? "border-red-500/30 bg-red-500/15 text-red-100"
              : "border-emerald-500/30 bg-emerald-500/15 text-emerald-100"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

function MethodImageCell({
  method,
  signParams,
}: {
  method: Method;
  signParams: SignParams | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!signParams) {
      setError("Cloudinary belum dikonfigurasi");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", signParams.apiKey);
      fd.append("timestamp", String(signParams.timestamp));
      fd.append("signature", signParams.signature);
      fd.append("folder", "payment-methods");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${signParams.cloudName}/image/upload`,
        { method: "POST", body: fd }
      );
      if (!res.ok) {
        const t = await res.text();
        let msg = t;
        try {
          msg = JSON.parse(t)?.error?.message ?? t;
        } catch {}
        if (/cloud_name.*disabled/i.test(msg)) {
          throw new Error(
            `Cloudinary cloud disabled. Aktifkan di dashboard Cloudinary.`
          );
        }
        throw new Error(msg);
      }
      const json = await res.json();

      const saveRes = await fetch(
        `/api/admin/payment-methods/${method.id}/image`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicId: json.public_id,
            url: json.secure_url,
          }),
        }
      );
      if (!saveRes.ok) throw new Error("Gagal simpan");

      if (inputRef.current) inputRef.current.value = "";
      window.location.reload();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setUploading(false);
    }
  }

  if (method.image_url) {
    return (
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={method.image_url}
          alt={method.label}
          className="h-8 w-8 rounded object-contain bg-white"
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
          disabled={uploading}
        >
          Ganti
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={upload}
        />
        {error && (
          <span className="text-xs text-red-300">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading || !signParams}
        className="rounded-md border border-dashed border-white/15 bg-white/[0.04] px-2 py-1 text-xs text-white/60 hover:bg-white/[0.08] disabled:opacity-50"
      >
        {uploading ? "Uploading…" : signParams ? "Upload" : "Cloud off"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={upload}
      />
      {error && (
        <div className="mt-1 text-xs text-red-300">{error}</div>
      )}
    </div>
  );
}

function AddMethodForm({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [group, setGroup] = useState("E-Wallet");
  const [fee, setFee] = useState(0);
  const [sub, setSub] = useState("");
  const [color, setColor] = useState("#7C5CFF");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        label: label.trim(),
        group_label: group,
        fee_idr: fee,
        sub_label: sub.trim() || null,
        icon_color: color,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Gagal");
      return;
    }
    onDone();
  }

  return (
    <form
      onSubmit={save}
      className="space-y-3 rounded-2xl border border-violet-400/30 bg-violet-500/5 p-5"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Label">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            placeholder="DANA"
          />
        </Field>
        <Field label="Code (slug)">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            placeholder="dana"
          />
        </Field>
        <Field label="Group">
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option>QRIS</option>
            <option>E-Wallet</option>
            <option>Virtual Account</option>
            <option>Gerai Retail</option>
            <option>Bank Transfer</option>
          </select>
        </Field>
        <Field label="Biaya (Rp)">
          <input
            type="number"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
          />
        </Field>
        <Field label="Sub label (opsional)">
          <input
            value={sub}
            onChange={(e) => setSub(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            placeholder="Instan"
          />
        </Field>
        <Field label="Warna">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-full rounded-lg border border-white/10 bg-black/40"
          />
        </Field>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-50"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}
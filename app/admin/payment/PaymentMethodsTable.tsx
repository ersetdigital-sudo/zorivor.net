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

export function PaymentMethodsTable({ methods }: { methods: Method[] }) {
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
                      <FeeCell
                        methodId={m.id}
                        fee={m.fee_idr}
                      />
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

function FeeCell({
  methodId,
  fee,
}: {
  methodId: string;
  fee: number;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(fee);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) setValue(fee);
  }, [fee, editing]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payment-methods/${methodId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fee_idr: value }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      setEditing(false);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-left text-sm hover:bg-white/[0.05]"
        title="Klik untuk edit"
      >
        <span>{fee > 0 ? `Rp ${fee.toLocaleString("id-ID")}` : "Gratis"}</span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/30 opacity-0 transition group-hover:opacity-100"
        >
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        {error && <span className="ml-2 text-[10px] text-red-300">{error}</span>}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={0}
        value={value}
        autoFocus
        onChange={(e) => setValue(Number(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setValue(fee);
            setEditing(false);
          }
        }}
        onBlur={save}
        disabled={saving}
        className="w-24 rounded-md border border-violet-400/40 bg-black/40 px-2 py-1 text-xs text-white outline-none focus:border-violet-400/80"
      />
      {saving && <span className="text-[10px] text-white/40">…</span>}
      {error && <span className="text-[10px] text-red-300">{error}</span>}
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
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconTrash } from "@/components/Icons";

type Setting = {
  key: string;
  value: unknown;
  updated_at: string;
};

// Per-key type hints so editors can use friendly inputs instead of raw JSON
const KNOWN_TYPES: Record<string, "string" | "number" | "boolean" | "json" | "string[]"> = {
  site_name: "string",
  hero_title: "string",
  cashback_global_pct: "number",
  payment_methods: "string[]",
};

function prettyValue(v: unknown): string {
  if (typeof v === "string") return v;
  return JSON.stringify(v, null, 2);
}

function parseInput(raw: string, hint: "string" | "number" | "boolean" | "json" | "string[]") {
  if (hint === "string") return raw;
  if (hint === "number") {
    const n = Number(raw);
    if (isNaN(n)) throw new Error("Bukan angka valid");
    return n;
  }
  if (hint === "boolean") {
    if (raw === "true") return true;
    if (raw === "false") return false;
    throw new Error("Harus 'true' atau 'false'");
  }
  if (hint === "string[]") {
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    return lines;
  }
  // json
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("JSON tidak valid");
  }
}

export function SettingsEditor({ settings }: { settings: Setting[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);

  async function save(key: string, rawValue: string, hint: typeof KNOWN_TYPES[string]) {
    try {
      const parsed = parseInput(rawValue, hint);
      const res = await fetch(`/api/admin/settings/${encodeURIComponent(key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: parsed }),
      });
      if (!res.ok) {
        const e = await res.json();
        alert(e.error ?? "Gagal simpan");
        return false;
      }
      startTransition(() => router.refresh());
      return true;
    } catch (e: any) {
      alert(e?.message ?? String(e));
      return false;
    }
  }

  async function remove(key: string) {
    if (!confirm(`Hapus setting "${key}"?`)) return;
    await fetch(`/api/admin/settings/${encodeURIComponent(key)}`, {
      method: "DELETE",
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
        >
          <IconPlus /> Tambah Setting
        </button>
      </div>

      {showAdd && (
        <AddSettingForm
          onDone={() => {
            setShowAdd(false);
            startTransition(() => router.refresh());
          }}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {settings.map((s) => {
          const hint = KNOWN_TYPES[s.key] ?? "json";
          return (
            <SettingCard
              key={s.key}
              setting={s}
              hint={hint}
              pending={pending}
              onSave={(raw) => save(s.key, raw, hint)}
              onRemove={() => remove(s.key)}
            />
          );
        })}
        {settings.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/60">
            Belum ada setting
          </div>
        )}
      </div>
    </div>
  );
}

function SettingCard({
  setting,
  hint,
  pending,
  onSave,
  onRemove,
}: {
  setting: Setting;
  hint: "string" | "number" | "boolean" | "json" | "string[]";
  pending: boolean;
  onSave: (raw: string) => Promise<boolean>;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState(() => rawForEdit(setting.value, hint));

  const display = prettyValue(setting.value);

  if (editing) {
    return (
      <div className="rounded-2xl border border-violet-400/30 bg-violet-500/5 p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-mono text-xs uppercase tracking-wide text-white/80">
            {setting.key}
          </div>
          <span className="text-[10px] uppercase text-violet-300">editing</span>
        </div>
        {hint === "boolean" ? (
          <select
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : hint === "string" || hint === "number" ? (
          <input
            type={hint === "number" ? "number" : "text"}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
          />
        ) : (
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={hint === "string[]" ? 5 : 8}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-white outline-none focus:border-violet-400/60"
          />
        )}
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={() => {
              setRaw(rawForEdit(setting.value, hint));
              setEditing(false);
            }}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
          >
            Batal
          </button>
          <button
            onClick={async () => {
              const ok = await onSave(raw);
              if (ok) setEditing(false);
            }}
            disabled={pending}
            className="rounded-md bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-50"
          >
            Simpan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-wide text-white/60">
          {setting.key}
        </div>
        <div className="text-[10px] text-white/40">
          {new Date(setting.updated_at).toLocaleString("id-ID")}
        </div>
      </div>
      <pre className="max-h-32 overflow-auto rounded-lg border border-white/5 bg-black/40 p-3 text-xs text-white/90">
        {display}
      </pre>
      <div className="mt-2 flex justify-end gap-2">
        <button
          onClick={() => setEditing(true)}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
        >
          Edit
        </button>
        <button
          onClick={onRemove}
          disabled={pending}
          className="rounded-md bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

function rawForEdit(v: unknown, hint: "string" | "number" | "boolean" | "json" | "string[]"): string {
  if (hint === "string" || hint === "number") {
    return v == null ? "" : String(v);
  }
  if (hint === "boolean") {
    return v ? "true" : "false";
  }
  if (hint === "string[]") {
    return Array.isArray(v) ? v.join("\n") : "";
  }
  return v == null ? "" : JSON.stringify(v, null, 2);
}

function AddSettingForm({ onDone }: { onDone: () => void }) {
  const [key, setKey] = useState("");
  const [hint, setHint] = useState<"string" | "number" | "boolean" | "json" | "string[]">("string");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const parsed = parseInput(value, hint);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim(), value: parsed }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error ?? "Gagal");
      }
      onDone();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="space-y-3 rounded-2xl border border-violet-400/30 bg-violet-500/5 p-5"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Key (slug)">
          <input
            value={key}
            onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
            required
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            placeholder="cashback_max_idr"
          />
        </Field>
        <Field label="Tipe">
          <select
            value={hint}
            onChange={(e) => setHint(e.target.value as typeof hint)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="string">String (text)</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean (true/false)</option>
            <option value="string[]">String array (satu per baris)</option>
            <option value="json">JSON object/array</option>
          </select>
        </Field>
      </div>

      <Field label="Value">
        {hint === "boolean" ? (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="">— pilih —</option>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : hint === "string" || hint === "number" ? (
          <input
            type={hint === "number" ? "number" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={5}
            placeholder={
              hint === "string[]"
                ? "QRIS\nDANA\nOVO"
                : '{"hero":"text","cta":"link"}'
            }
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-white outline-none focus:border-violet-400/60"
          />
        )}
      </Field>

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
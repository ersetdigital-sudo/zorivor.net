"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Admin = {
  user_id: string;
  email: string;
  is_super_admin: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
};

type FormState = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};

const EMPTY: FormState = { name: "", email: "", password: "", confirm: "" };

export function AddAdminModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (a: Admin) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setError(null);
      setShowPw(false);
      setTouched({ name: false, email: false, password: false, confirm: false });
    }
  }, [open]);

  // Escape closes, auto-focus first input on open
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  const emailError =
    touched.email && form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)
      ? "Format email tidak valid"
      : null;
  const passwordError =
    touched.password && form.password && form.password.length < 8
      ? "Password minimal 8 karakter"
      : null;
  const confirmError =
    touched.confirm && form.confirm && form.confirm !== form.password
      ? "Konfirmasi password tidak cocok"
      : null;

  const canSubmit =
    form.email.trim() &&
    form.password.length >= 8 &&
    form.password === form.confirm &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) &&
    !saving;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim() || null,
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      onCreated(json.admin);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Tutup"
        onClick={() => !saving && onClose()}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        tabIndex={-1}
      />

      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md origin-center animate-[confirm-in_180ms_ease-out] rounded-2xl border border-white/10 bg-[#0f1320] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Tambah Admin</h2>
            <p className="mt-1 text-xs text-white/50">
              Admin baru akan dibuat dan langsung bisa login ke dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Tutup"
            className="grid h-8 w-8 place-items-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <Field label="Nama (opsional)">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Admin CS"
              autoComplete="off"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            />
          </Field>
          <Field label="Email" error={emailError}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              required
              placeholder="admin@zorivor.net"
              autoComplete="off"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            />
          </Field>
          <Field label="Password" error={passwordError} hint="Minimal 8 karakter">
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 pr-20 text-sm text-white outline-none focus:border-violet-400/60"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[11px] text-white/50 hover:bg-white/[0.06] hover:text-white"
              >
                {showPw ? "Sembunyi" : "Lihat"}
              </button>
            </div>
          </Field>
          <Field label="Konfirmasi password" error={confirmError}>
            <input
              type={showPw ? "text" : "password"}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            />
          </Field>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <span
                  aria-hidden
                  className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
                Membuat…
              </>
            ) : (
              "Buat Admin"
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes confirm-in {
          from { opacity: 0; transform: scale(0.96) translateY(4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-white/70">{label}</span>
        {hint && <span className="text-[10px] text-white/40">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </label>
  );
}
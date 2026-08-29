"use client";

import { useEffect, useState } from "react";

type Admin = {
  user_id: string;
  email: string;
};

export function ChangePasswordModal({
  target,
  currentUserId,
  onClose,
  onSuccess,
}: {
  target: Admin | null;
  currentUserId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [showPw, setShowPw] = useState(false);
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    current: false,
    password: false,
    confirm: false,
  });

  const isSelf = target?.user_id === currentUserId;

  useEffect(() => {
    if (target) {
      setCurrent("");
      setPassword("");
      setConfirm("");
      setError(null);
      setShowPw(false);
      setTouched({ current: false, password: false, confirm: false });
    }
  }, [target]);

  useEffect(() => {
    if (!target) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, saving, onClose]);

  if (!target) return null;

  const passwordError =
    touched.password && password && password.length < 8
      ? "Password minimal 8 karakter"
      : null;
  const confirmError =
    touched.confirm && confirm && confirm !== password
      ? "Konfirmasi password tidak cocok"
      : null;
  const currentError =
    touched.current && isSelf && current.length === 0
      ? "Password lama wajib diisi"
      : null;

  const canSubmit =
    password.length >= 8 &&
    password === confirm &&
    (!isSelf || current.length > 0) &&
    !saving;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ current: true, password: true, confirm: true });
    if (!canSubmit || !target) return;
    const targetId = target.user_id;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/admins/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          currentPassword: isSelf ? current : undefined,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error ?? `HTTP ${res.status}`);
      }
      onSuccess();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

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
            <h2 className="text-lg font-semibold text-white">Ubah Password</h2>
            <p className="mt-1 text-xs text-white/50">
              {isSelf ? (
                <>Untuk akun kamu sendiri. Masukkan password lama untuk konfirmasi.</>
              ) : (
                <>
                  Reset password untuk{" "}
                  <span className="font-mono text-white/80">
                    {target.email}
                  </span>
                  .
                </>
              )}
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
          {isSelf && target && (
            <Field label="Password lama" error={currentError}>
              <input
                type={showPw ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, current: true }))}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
              />
            </Field>
          )}
          <Field label="Password baru" error={passwordError} hint="Minimal 8 karakter">
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          <Field label="Konfirmasi password baru" error={confirmError}>
            <input
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
                Menyimpan…
              </>
            ) : (
              "Simpan Password"
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
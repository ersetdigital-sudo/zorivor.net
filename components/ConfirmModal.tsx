"use client";

import { useEffect, useRef, useState } from "react";

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  /** The name of the thing being deleted, rendered prominently. */
  itemName?: string;
  /** Optional extra context (e.g. "Pelanggan terkait: 12") */
  details?: React.ReactNode;
  /** Button label. Default: "Hapus". */
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual tone — currently only 'danger'. */
  tone?: "danger";
  /** Disable confirm button (used while the call is in flight). */
  loading?: boolean;
  /** Custom error from the underlying call so the modal can show it. */
  error?: string | null;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

/**
 * Custom confirm dialog — replaces window.confirm().
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   <button onClick={() => setOpen(true)}>Hapus</button>
 *   <ConfirmModal
 *     open={open}
 *     title="Hapus Game?"
 *     itemName={game.name}
 *     description="Game yang dihapus akan hilang dari katalog."
 *     loading={removing}
 *     error={error}
 *     onConfirm={async () => { await remove(); setOpen(false); }}
 *     onCancel={() => setOpen(false)}
 *   />
 */
export function ConfirmModal({
  open,
  title,
  description,
  itemName,
  details,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  tone = "danger",
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when modal opens (safer default for destructive action)
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => cancelRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Escape closes (treat as cancel). Enter triggers confirm (only if not loading).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (!loading) onCancel();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (!loading) void onConfirm();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel, onConfirm]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const toneClasses = {
    danger: {
      iconBg: "bg-red-500/15",
      iconText: "text-red-300",
      button: "bg-red-500 hover:bg-red-600 focus-visible:ring-red-400/60",
    },
  }[tone];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Backdrop */}
      <button
        aria-label="Tutup"
        onClick={() => !loading && onCancel()}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        tabIndex={-1}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md origin-center animate-[confirm-in_180ms_ease-out] rounded-2xl border border-white/10 bg-[#0f1320] p-6 shadow-2xl"
      >
        {/* Close (X) */}
        <button
          onClick={onCancel}
          disabled={loading}
          aria-label="Tutup"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
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

        {/* Icon */}
        <div
          className={`mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full ${toneClasses.iconBg}`}
        >
          {tone === "danger" ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={toneClasses.iconText}
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          ) : null}
        </div>

        {/* Title + body */}
        <h2
          id="confirm-title"
          className="text-center text-lg font-semibold text-white"
        >
          {title}
        </h2>

        {itemName && (
          <div className="mt-3 flex justify-center">
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-sm text-white">
              {itemName}
            </span>
          </div>
        )}

        {description && (
          <p className="mt-3 text-center text-sm text-white/60">
            {description}
          </p>
        )}

        {details && (
          <div className="mt-3 text-center text-xs text-white/40">
            {details}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-200">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => void onConfirm()}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1320] disabled:opacity-60 ${toneClasses.button}`}
          >
            {loading && (
              <span
                aria-hidden
                className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            )}
            {loading ? "Menghapus…" : confirmLabel}
          </button>
        </div>
      </div>

      {/* keyframes for the modal pop */}
      <style>{`
        @keyframes confirm-in {
          from { opacity: 0; transform: scale(0.96) translateY(4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}

/**
 * Tiny hook to manage a confirm-modal flow: open state, loading, error.
 * Returns { open, ask(opts), state, ConfirmNode }.
 *
 *   const { ask, ConfirmNode } = useConfirm();
 *   ask({ title: 'Hapus?', itemName: 'X', onConfirm: async () => {...} });
 *
 * Renders <ConfirmNode /> once at the page root.
 */
export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opts, setOpts] = useState<Omit<ConfirmModalProps, "open" | "loading" | "error" | "onCancel"> | null>(
    null
  );

  function ask(
    o: Omit<ConfirmModalProps, "open" | "loading" | "error" | "onCancel">
  ) {
    setError(null);
    setLoading(false);
    setOpts(o);
    setOpen(true);
  }

  function close() {
    if (loading) return;
    setOpen(false);
    setOpts(null);
    setError(null);
  }

  async function confirm() {
    if (!opts) return;
    try {
      setLoading(true);
      setError(null);
      await opts.onConfirm();
      setOpen(false);
      setOpts(null);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  const ConfirmNode = () =>
    opts ? (
      <ConfirmModal
        {...opts}
        open={open}
        loading={loading}
        error={error}
        onConfirm={confirm}
        onCancel={close}
      />
    ) : null;

  return { ask, close, ConfirmNode };
}
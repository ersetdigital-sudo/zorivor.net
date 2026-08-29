"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_SUPPORT_WA, waMeUrl } from "@/lib/wa";
import { Toast } from "@/components/Toast";
import { humaniseError } from "@/lib/errors";

type Status = "idle" | "saving" | "saved" | "error";

/**
 * WhatsApp CS setting with explicit Edit / Simpan flow.
 *
 * - View mode: input is read-only, "Edit" button visible
 * - Click Edit  -> input becomes editable, focused, button -> "Simpan"
 * - Click Simpan -> validation; if valid, PATCH, show toast, return to view
 * - Invalid input -> Simpan disabled + inline error
 */
export function WhatsAppSetting({
  initial,
  updatedAt,
}: {
  initial: string;
  updatedAt: string | null;
}) {
  const router = useRouter();

  // display = what's currently shown in the input (also the "saved" value while in view mode)
  const [display, setDisplay] = useState(initial);
  // editBuffer = working value while in edit mode
  const [editing, setEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState(initial);

  const [status, setStatus] = useState<Status>("idle");
  const [validationError, setValidationError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const lastUpdated = updatedAt
    ? new Date(updatedAt).toLocaleString("id-ID")
    : "—";

  // If server data refreshes (e.g. after save), sync display
  useEffect(() => {
    if (!editing) setDisplay(initial);
  }, [initial, editing]);

  function enterEdit() {
    setEditBuffer(display);
    setValidationError(null);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 30);
  }

  function cancelEdit() {
    setEditBuffer(display);
    setValidationError(null);
    setEditing(false);
  }

  function onChangeBuffer(e: React.ChangeEvent<HTMLInputElement>) {
    // Allow only digits, +, spaces — strip everything else
    const cleaned = e.target.value.replace(/[^\d+\s]/g, "");
    setEditBuffer(cleaned);
    if (validationError) setValidationError(null);
  }

  function validate(raw: string): string | null {
    const normalised = normaliseToInternational(raw);
    if (!normalised) return "Nomor WhatsApp wajib diisi";
    if (normalised.length < 9) return "Nomor terlalu pendek";
    if (normalised.length > 20) return "Nomor terlalu panjang";
    if (!/^62\d+$/.test(normalised)) {
      return "Format tidak valid (harus 62xxxxxxxxxx)";
    }
    return null;
  }

  async function save() {
    const normalised = normaliseToInternational(editBuffer);
    const err = validate(editBuffer);
    if (err) {
      setValidationError(err);
      return;
    }

    setStatus("saving");
    try {
      const res = await fetch(
        `/api/admin/settings/${encodeURIComponent("support_whatsapp")}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: normalised }),
        }
      );
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(humaniseError(e.error, "Gagal menyimpan"));
      }
      setDisplay(normalised);
      setEditing(false);
      setStatus("saved");
      Toast.success("Nomor WhatsApp berhasil disimpan");
      router.refresh();
    } catch (e: any) {
      setStatus("error");
      Toast.error("Gagal menyimpan, coba lagi");
    }
  }

  const previewUrl = waMeUrl(display || DEFAULT_SUPPORT_WA);

  // Displayed value in the input while in view mode: format nicely
  // (e.g. "62 812-3456-7890") so admin can read the number.
  const viewDisplay = display
    ? formatForDisplay(display)
    : "—";

  const showSimpanEnabled =
    editing && validationError === null && normaliseToInternational(editBuffer) !== display;

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-white">Nomor WhatsApp</div>
            <div className="mt-0.5 text-[11px] text-white/40">
              Update terakhir: {lastUpdated}
            </div>
          </div>

          {editing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={status === "saving"}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/[0.08] disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!showSimpanEnabled || status === "saving"}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "saving" ? (
                  <>
                    <span
                      aria-hidden
                      className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    Menyimpan…
                  </>
                ) : (
                  "Simpan"
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={enterEdit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/[0.08]"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
              Edit
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-base text-white/60">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="tel"
            inputMode="tel"
            autoComplete="off"
            value={editing ? editBuffer : viewDisplay}
            onChange={onChangeBuffer}
            disabled={!editing}
            placeholder={editing ? "6281234567890" : "—"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && editing) {
                e.preventDefault();
                if (showSimpanEnabled) void save();
              }
              if (e.key === "Escape" && editing) {
                e.preventDefault();
                cancelEdit();
              }
            }}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition ${
              editing
                ? validationError
                  ? "border-red-500/50 bg-black/40 text-white focus:border-red-400"
                  : "border-white/15 bg-black/40 text-white focus:border-violet-400/60"
                : "border-white/10 bg-white/[0.02] text-white/70 cursor-not-allowed"
            }`}
          />
        </div>

        {validationError ? (
          <p className="mt-2 text-xs text-red-300">{validationError}</p>
        ) : (
          <p className="mt-2 text-xs text-white/50">
            Format: 62xxxxxxxxxx (kode negara 62 untuk Indonesia). Tanda{" "}
            <code className="rounded bg-black/30 px-1">+</code> / spasi akan
            dihapus otomatis.
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
          <span>Link jadi:</span>
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-white/5 px-2 py-0.5 font-mono text-emerald-300 hover:bg-white/10"
          >
            {previewUrl}
          </a>
        </div>
      </div>
    </>
  );
}

/** Strip everything that isn't a digit, normalise to 62xxxxxxxxxx. */
function normaliseToInternational(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return "62" + digits;
}

/** Render a phone string with light grouping for readability. */
function formatForDisplay(num: string): string {
  if (!num) return "";
  // keep 62 prefix visible, then group by 3-4-4
  if (num.startsWith("62") && num.length > 2) {
    const rest = num.slice(2);
    const a = rest.slice(0, 3);
    const b = rest.slice(3, 7);
    const c = rest.slice(7);
    return ["62", a, b, c].filter(Boolean).join("-");
  }
  return num;
}
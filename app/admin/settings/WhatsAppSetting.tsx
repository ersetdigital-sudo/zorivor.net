"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_SUPPORT_WA, waMeUrl } from "@/lib/wa";

const DEFAULT_WA = DEFAULT_SUPPORT_WA;

type Status = "idle" | "saving" | "saved" | "error";

/**
 * Single-field WhatsApp setting — auto-saves on blur, no submit button,
 * no edit/preview toggle. The field is always editable. After save,
 * show a brief "Tersimpan" indicator (auto-dismiss after 2.5s).
 */
export function WhatsAppSetting({
  initial,
  updatedAt,
}: {
  initial: string;
  updatedAt: string | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  // Keep input in sync if server data refreshes (e.g. router.refresh())
  useEffect(() => {
    if (!dirty.current) setValue(initial);
  }, [initial]);

  useEffect(() => {
    return () => {
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, []);

  function flashSaved() {
    if (statusTimer.current) clearTimeout(statusTimer.current);
    setStatus("saved");
    statusTimer.current = setTimeout(() => setStatus("idle"), 2500);
  }

  async function save(next: string) {
    if (statusTimer.current) clearTimeout(statusTimer.current);
    setStatus("saving");
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/admin/settings/${encodeURIComponent("support_whatsapp")}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: next }),
        }
      );
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error ?? `HTTP ${res.status}`);
      }
      flashSaved();
      // Refresh server data so any consumer picks up the new value
      startTransition(() => router.refresh());
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message ?? String(e));
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    dirty.current = true;
    // Allow only digits, +, spaces; strip everything else while typing
    const cleaned = e.target.value.replace(/[^\d+\s]/g, "");
    setValue(cleaned);
  }

  function onBlur() {
    const normalised = normaliseToInternational(value);
    setValue(normalised);
    if (normalised !== initial) {
      void save(normalised);
    } else {
      // no change vs. server value — re-sync
      dirty.current = false;
      setStatus("idle");
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement).blur();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setValue(initial);
      dirty.current = false;
      (e.currentTarget as HTMLInputElement).blur();
    }
  }

  const previewUrl = waMeUrl(value || DEFAULT_WA);
  const lastUpdated = updatedAt
    ? new Date(updatedAt).toLocaleString("id-ID")
    : "—";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <label className="block">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-white">Nomor WhatsApp</span>
          <span
            className={`text-[10px] uppercase tracking-wider transition ${
              status === "saving"
                ? "text-white/40"
                : status === "saved"
                ? "text-emerald-300"
                : status === "error"
                ? "text-red-300"
                : "text-white/30"
            }`}
          >
            {status === "saving" && "Menyimpan…"}
            {status === "saved" && "Tersimpan"}
            {status === "error" && (errorMsg ?? "Gagal")}
            {status === "idle" && `Update terakhir: ${lastUpdated}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
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
            type="tel"
            inputMode="tel"
            autoComplete="off"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            placeholder="6281234567890"
            className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-violet-400/60"
          />
        </div>
        <p className="mt-2 text-xs text-white/50">
          Format: 62xxxxxxxxxx (kode negara 62 untuk Indonesia). Tanda{" "}
          <code className="rounded bg-black/30 px-1">+</code> / spasi akan
          dihapus otomatis. Disimpan saat klik di luar input atau tekan{" "}
          <kbd className="rounded bg-black/30 px-1 text-[10px]">Enter</kbd>.
        </p>
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
      </label>
    </div>
  );
}

/** Normalise a user-typed phone to international form (62xxxxxxxxxx). */
function normaliseToInternational(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  // bare local number (e.g. "8123…") — prepend 62
  return "62" + digits;
}
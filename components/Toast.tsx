"use client";

import { useEffect, useState } from "react";

type ToastItem = {
  id: number;
  kind: "success" | "error" | "info";
  message: string;
};

const listeners = new Set<(t: ToastItem) => void>();
let nextId = 1;

/**
 * Imperative toast API — call from anywhere in the client tree:
 *   Toast.success("Saved");
 *   Toast.error("Failed");
 */
export const Toast = {
  success(message: string) {
    emit({ id: nextId++, kind: "success", message });
  },
  error(message: string) {
    emit({ id: nextId++, kind: "error", message });
  },
  info(message: string) {
    emit({ id: nextId++, kind: "info", message });
  },
};

function emit(t: ToastItem) {
  listeners.forEach((fn) => fn(t));
}

const DURATION_MS = 3500;

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(t: ToastItem) {
      setItems((prev) => [...prev, t]);
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
      }, DURATION_MS);
    }
    listeners.add(onToast);
    return () => {
      listeners.delete(onToast);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex min-w-[260px] max-w-sm items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-2xl backdrop-blur-md animate-[toast-in_180ms_ease-out] ${
            t.kind === "success"
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-100"
              : t.kind === "error"
              ? "border-red-500/30 bg-red-500/15 text-red-100"
              : "border-white/15 bg-white/[0.08] text-white"
          }`}
        >
          {t.kind === "success" ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="m5 13 4 4L19 7" />
            </svg>
          ) : t.kind === "error" ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8h.01" />
              <path d="M11 12h1v4h1" />
            </svg>
          )}
          <span className="flex-1">{t.message}</span>
        </div>
      ))}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
      `}</style>
    </div>
  );
}
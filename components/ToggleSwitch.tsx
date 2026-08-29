"use client";

import { useId } from "react";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  ariaLabel?: string;
};

/**
 * Pill toggle switch with smooth knob slide + color fade.
 *
 *   [●----]   off  (knob left,  track gray)
 *   [----●]   on   (knob right, track emerald)
 *
 * Optimistic-friendly: parent should pass `checked` (the rendered state)
 * and react to `onChange(next)` — no internal state, so the parent's
 * optimistic updates flow through immediately.
 */
export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  size = "md",
  ariaLabel,
}: ToggleSwitchProps) {
  const id = useId();
  const label = ariaLabel ?? "Toggle";

  const trackW = size === "sm" ? 28 : 36;
  const trackH = size === "sm" ? 16 : 20;
  const knob = size === "sm" ? 12 : 16;
  const offset = checked ? trackW - knob - 2 : 2;

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className={`relative inline-flex shrink-0 cursor-pointer items-center rounded-full border outline-none transition-[background-color,border-color,opacity] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-violet-400/60 ${
        checked
          ? "border-emerald-400/30 bg-emerald-500/70 hover:bg-emerald-500/80"
          : "border-white/15 bg-white/15 hover:bg-white/25"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      style={{ width: trackW, height: trackH }}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-[left,background-color] duration-200 ease-out`}
        style={{
          width: knob,
          height: knob,
          left: offset,
          backgroundColor: checked ? "#fff" : "#f4f4f5",
        }}
      />
    </button>
  );
}
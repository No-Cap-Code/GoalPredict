// ============================================================
// GoalPredict — TeamBadge component
// Flags via emoji (demo), falls back to initials if unavailable
// ============================================================

"use client";

interface TeamBadgeProps {
  team: string;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

import { FLAG_MAP } from "@/lib/worldcup2026";

const SIZE_STYLES = {
  sm: "text-sm px-2 py-1",
  md: "text-base px-4 py-2",
  lg: "text-lg px-6 py-3",
};

export default function TeamBadge({
  team,
  size = "md",
  selected = false,
  onClick,
  disabled = false,
}: TeamBadgeProps) {
  const flag = FLAG_MAP[team] ?? "\u{1F3C6}"; // fallback trophy

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 rounded-lg border-2 font-semibold
        transition-all duration-200 whitespace-nowrap
        ${SIZE_STYLES[size]}
        ${
          selected
            ? "border-emerald-400 bg-emerald-900/50 text-emerald-200 shadow-lg shadow-emerald-900/30"
            : "border-slate-600 bg-slate-800/60 text-slate-200 hover:border-slate-400 hover:bg-slate-700/60"
        }
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      `}
    >
      <span className="text-xl">{flag}</span>
      <span>{team}</span>
    </button>
  );
}

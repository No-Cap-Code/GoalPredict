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

// Very rough country/team → flag emoji mapping (demo)
const FLAG_MAP: Record<string, string> = {
  Brazil: "\u{1F1E7}\u{1F1F7}",
  Argentina: "\u{1F1E6}\u{1F1F7}",
  Germany: "\u{1F1E9}\u{1F1EA}",
  France: "\u{1F1EB}\u{1F1F7}",
  Spain: "\u{1F1EA}\u{1F1F8}",
  Portugal: "\u{1F1F5}\u{1F1F9}",
  England: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  Netherlands: "\u{1F1F3}\u{1F1F1}",
  Italy: "\u{1F1EE}\u{1F1F9}",
  Croatia: "\u{1F1ED}\u{1F1F7}",
  Belgium: "\u{1F1E7}\u{1F1EA}",
  Morocco: "\u{1F1F2}\u{1F1E6}",
  Japan: "\u{1F1EF}\u{1F1F5}",
  "South Korea": "\u{1F1F0}\u{1F1F7}",
  Switzerland: "\u{1F1E8}\u{1F1ED}",
  USA: "\u{1F1FA}\u{1F1F8}",
  Senegal: "\u{1F1F8}\u{1F1F3}",
  Uruguay: "\u{1F1FA}\u{1F1FE}",
  Colombia: "\u{1F1E8}\u{1F1F4}",
  Sweden: "\u{1F1F8}\u{1F1EA}",
  Poland: "\u{1F1F5}\u{1F1F1}",
  Denmark: "\u{1F1E9}\u{1F1F0}",
  Australia: "\u{1F1E6}\u{1F1FA}",
};

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

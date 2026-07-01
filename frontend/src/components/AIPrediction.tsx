// ============================================================
// GoalPredict — AIPrediction component
// Shows QVAC AI prediction with animated progress bars
// ============================================================

"use client";

import type { Prediction } from "@/types";

interface AIPredictionProps {
  prediction: Prediction | null;
  loading?: boolean;
}

export default function AIPrediction({
  prediction,
  loading = false,
}: AIPredictionProps) {
  if (loading || !prediction) {
    return (
      <div className="rounded-lg bg-slate-800/60 p-3 border border-slate-700 animate-pulse">
        <div className="h-4 w-28 bg-slate-700 rounded mb-3" />
        <div className="space-y-2">
          <div className="h-2.5 bg-slate-700 rounded-full w-full" />
          <div className="h-2.5 bg-slate-700 rounded-full w-3/4" />
          <div className="h-2.5 bg-slate-700 rounded-full w-5/6" />
        </div>
        <p className="text-xs text-slate-500 mt-2">QVAC AI loading...</p>
      </div>
    );
  }

  const bars = [
    {
      label: prediction.homeTeam,
      pct: prediction.homeWinPct,
      color: "bg-emerald-500",
      barColor: "bg-emerald-400",
    },
    {
      label: "Draw",
      pct: prediction.drawPct,
      color: "bg-amber-500",
      barColor: "bg-amber-400",
    },
    {
      label: prediction.awayTeam,
      pct: prediction.awayWinPct,
      color: "bg-rose-500",
      barColor: "bg-rose-400",
    },
  ];

  return (
    <div className="rounded-lg bg-slate-800/60 p-3 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          QVAC AI Prediction
        </span>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-full">
          {prediction.confidence}% confidence
        </span>
      </div>

      {/* Probability bars */}
      <div className="space-y-2.5">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium truncate max-w-[60%]">
                {bar.label}
              </span>
              <span className="text-slate-400 font-mono">{bar.pct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${bar.barColor}`}
                style={{ width: `${bar.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Predicted winner callout */}
      <div className="mt-3 pt-2 border-t border-slate-700/50 text-center">
        <span className="text-xs text-slate-500">Prediction: </span>
        <span className="text-sm font-bold text-emerald-300">
          {prediction.predictedWinner}
        </span>
      </div>
    </div>
  );
}

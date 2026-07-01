// ============================================================
// GoalPredict — Live Match Feed component
// Displays live match commentary with scoreboard, timeline,
// and streaming events
// ============================================================

"use client";

import { useEffect, useRef, useState } from "react";
import type { CommentaryEvent } from "@/lib/ai-commentary";
import { formatMinute } from "@/lib/ai-commentary";

interface LiveMatchFeedProps {
  homeTeam: { name: string; code: string; flag: string; score: number };
  awayTeam: { name: string; code: string; flag: string; score: number };
  status: "upcoming" | "live" | "finished";
  currentMinute: number;
  events: CommentaryEvent[];
  predictions: { homeWinPct: number; drawPct: number; awayWinPct: number };
}

const EVENT_ICONS: Record<string, string> = {
  goal: "⚽",
  yellow_card: "🟨",
  red_card: "🟥",
  substitution: "🔄",
  chance: "🎯",
  corner: "🏁",
  free_kick: "🎯",
  offside: "🚩",
  save: "🧤",
  half_time: "⏸️",
  full_time: "🏁",
  var_review: "📺",
  injury: "🤕",
  penalty: "⚡",
  build_up: "📊",
};

export default function LiveMatchFeed({
  homeTeam,
  awayTeam,
  status,
  currentMinute,
  events,
  predictions,
}: LiveMatchFeedProps) {
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to latest event
  useEffect(() => {
    if (autoScroll && eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [events.length, autoScroll]);

  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute);
  const isLive = status === "live";
  const isFinished = status === "finished";

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
      {/* Scoreboard */}
      <div className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-4 sm:p-6">
        {isLive && (
          <div className="absolute top-3 right-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              LIVE <span className="tabular-nums">{formatMinute(currentMinute)}</span>
            </span>
          </div>
        )}
        {isFinished && (
          <div className="absolute top-3 right-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Time</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2 w-28 sm:w-36">
            <span className="text-3xl sm:text-4xl drop-shadow-lg">{homeTeam.flag}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-200 text-center truncate max-w-full">
              {homeTeam.name}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className={`text-4xl sm:text-6xl font-black tabular-nums transition-all ${
              isLive ? "text-emerald-300" : isFinished ? "text-white" : "text-slate-400"
            }`}>
              {homeTeam.score}
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-500">:</span>
            <span className={`text-4xl sm:text-6xl font-black tabular-nums transition-all ${
              isLive ? "text-amber-300" : isFinished ? "text-white" : "text-slate-400"
            }`}>
              {awayTeam.score}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-2 w-28 sm:w-36">
            <span className="text-3xl sm:text-4xl drop-shadow-lg">{awayTeam.flag}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-200 text-center truncate max-w-full">
              {awayTeam.name}
            </span>
          </div>
        </div>

        {/* Predictions strip */}
        {status === "upcoming" && (
          <div className="mt-4 flex items-center gap-1.5 justify-center">
            <div className="h-2 rounded-full bg-emerald-500/60" style={{ width: `${predictions.homeWinPct}%` }} />
            <div className="h-2 rounded-full bg-amber-500/60" style={{ width: `${predictions.drawPct}%` }} />
            <div className="h-2 rounded-full bg-rose-500/60" style={{ width: `${predictions.awayWinPct}%` }} />
          </div>
        )}

        {/* Match timeline bar */}
        {isLive && (
          <div className="mt-4">
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${Math.min((currentMinute / 90) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-500">0&apos;</span>
              <span className="text-[10px] text-slate-500">45&apos;</span>
              <span className="text-[10px] text-slate-500">90&apos;</span>
            </div>
          </div>
        )}
      </div>

      {/* Commentary Feed */}
      <div
        className="relative divide-y divide-slate-800/50 max-h-80 overflow-y-auto"
        onScroll={() => {
          const el = eventsEndRef.current?.parentElement;
          if (el) {
            const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
            setAutoScroll(dist < 30);
          }
        }}
      >
        {/* Feed fade gradient */}
        <div className="sticky top-0 left-0 right-0 h-6 bg-gradient-to-b from-slate-900/60 to-transparent z-10 pointer-events-none" />

        {sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <span className="text-4xl mb-3">🎙️</span>
            <p className="text-sm">Waiting for match to begin...</p>
            <p className="text-xs mt-1">Commentary will appear here in real-time</p>
          </div>
        ) : (
          sortedEvents.map((event) => (
            <div
              key={event.id}
              className={`flex items-start gap-3 px-4 py-3 transition-all duration-300 animate-in slide-in-from-bottom-2 ${
                event.type === "goal"
                  ? "bg-emerald-900/30 hover:bg-emerald-900/40"
                  : event.type === "red_card"
                  ? "bg-rose-900/20 hover:bg-rose-900/30"
                  : event.type === "half_time"
                  ? "bg-amber-900/20 hover:bg-amber-900/30"
                  : event.type === "full_time"
                  ? "bg-blue-900/20 hover:bg-blue-900/30"
                  : "hover:bg-slate-800/30"
              }`}
            >
              {/* Minute badge */}
              <span className={`inline-flex items-center justify-center w-12 h-6 rounded-md text-xs font-bold flex-shrink-0 ${
                event.type === "goal"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : event.type === "red_card"
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-slate-700/50 text-slate-400"
              }`}>
                {formatMinute(event.minute)}
              </span>

              {/* Event icon */}
              <span className="text-lg flex-shrink-0">{EVENT_ICONS[event.type] || "📊"}</span>

              {/* Event text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${
                  event.type === "goal" ? "text-emerald-200 font-semibold" :
                  event.type === "red_card" ? "text-rose-200 font-semibold" :
                  "text-slate-300"
                }`}>
                  {event.text}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={eventsEndRef} />
      </div>
    </div>
  );
}

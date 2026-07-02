// ============================================================
// GoalPredict — Play page (World Cup 2026 edition)
// Bracket visual, live match feed, AI predictions, submit picks,
// stepper, toasts, animations
// ============================================================

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import BracketVisual, { type BracketMatch } from "@/components/BracketVisual";
import AIPrediction from "@/components/AIPrediction";
import LiveMatchFeed from "@/components/LiveMatchFeed";
import { useEnterTournament, useSubmitBracket } from "@/hooks/useGoalPredict";
import {
  predictMatch,
  loadPredictionModel,
  type QVACPrediction,
} from "@/lib/qvac";
import { TEAMS, FLAG_MAP, buildKnockoutBracket } from "@/lib/worldcup2026";
import {
  generateFullMatchCommentary,
  type CommentaryEvent,
} from "@/lib/ai-commentary";

// ---------- World Cup 2026 Knockout Bracket (R16) ----------
// Built from actual World Cup 2026 data using the knockout bracket generator
const KNOCKOUT_BRACKET = buildKnockoutBracket();

// Use first 8 R16 matches for bracket display
const WC2026_R16: { home: string; away: string }[] = KNOCKOUT_BRACKET
  .filter((m) => m.round === "R16")
  .slice(0, 8)
  .map((m) => ({ home: m.homeTeam, away: m.awayTeam }));

// ---------- Demo live match data ----------
interface LiveMatchData {
  homeTeam: { name: string; code: string; flag: string; score: number };
  awayTeam: { name: string; code: string; flag: string; score: number };
  status: "upcoming" | "live" | "finished";
  currentMinute: number;
  predictions: { homeWinPct: number; drawPct: number; awayWinPct: number };
}

function getTeamCode(name: string): string {
  return TEAMS.find((t) => t.name === name)?.code ?? name.slice(0, 3).toUpperCase();
}

function getTeamFlag(name: string): string {
  return FLAG_MAP[name] ?? "\u{1F3C6}";
}

const DEMO_LIVE_MATCHES: LiveMatchData[] = [
  {
    homeTeam: { name: "Brazil", code: getTeamCode("Brazil"), flag: getTeamFlag("Brazil"), score: 2 },
    awayTeam: { name: "South Korea", code: getTeamCode("South Korea"), flag: getTeamFlag("South Korea"), score: 1 },
    status: "live",
    currentMinute: 67,
    predictions: { homeWinPct: 62, drawPct: 20, awayWinPct: 18 },
  },
  {
    homeTeam: { name: "Argentina", code: getTeamCode("Argentina"), flag: getTeamFlag("Argentina"), score: 1 },
    awayTeam: { name: "Croatia", code: getTeamCode("Croatia"), flag: getTeamFlag("Croatia"), score: 1 },
    status: "live",
    currentMinute: 34,
    predictions: { homeWinPct: 55, drawPct: 25, awayWinPct: 20 },
  },
  {
    homeTeam: { name: "Spain", code: getTeamCode("Spain"), flag: getTeamFlag("Spain"), score: 3 },
    awayTeam: { name: "Morocco", code: getTeamCode("Morocco"), flag: getTeamFlag("Morocco"), score: 0 },
    status: "finished",
    currentMinute: 90,
    predictions: { homeWinPct: 58, drawPct: 22, awayWinPct: 20 },
  },
];

// ---------- Toast types ----------
type ToastType = "pending" | "success" | "error";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

// ---------- Stepper ----------
const STEPS = [
  { label: "Enter Tournament" },
  { label: "Select Winners" },
  { label: "Lock Picks" },
  { label: "Claim Winnings" },
];

function ProgressStepper({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="mb-8 flex items-center justify-center">
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;

          return (
            <div key={step.label} className="flex items-center">
              {/* Circle + label */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : isCurrent
                      ? "border-amber-400 bg-amber-400/20 text-amber-300"
                      : "border-slate-600 bg-slate-800 text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-2 whitespace-nowrap text-xs font-medium ${
                    isCompleted
                      ? "text-emerald-400"
                      : isCurrent
                      ? "text-amber-300"
                      : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-1 mb-6 h-0.5 w-10 sm:w-16 ${
                    i < currentStep ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Toast component ----------
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-sm transition-all duration-300 animate-slide-in ${
            toast.type === "pending"
              ? "border-amber-700/60 bg-amber-950/90 text-amber-200"
              : toast.type === "success"
              ? "border-emerald-700/60 bg-emerald-950/90 text-emerald-200"
              : "border-red-700/60 bg-red-950/90 text-red-200"
          }`}
        >
          {/* Icon */}
          <span className="text-lg">
            {toast.type === "pending" && (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            )}
            {toast.type === "success" && (
              <svg
                className="h-5 w-5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {toast.type === "error" && (
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </span>

          {/* Message */}
          <span className="text-sm font-medium">{toast.message}</span>

          {/* Dismiss */}
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-2 text-slate-500 transition hover:text-slate-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------- Tooltip component ----------
function HelpTooltip({ text }: { text: string }) {
  return (
    <span className="group/tooltip relative inline-flex">
      <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-slate-400 transition-colors group-hover/tooltip:bg-slate-600 group-hover/tooltip:text-slate-200">
        ?
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-300 opacity-0 shadow-xl transition-opacity duration-150 group-hover/tooltip:opacity-100">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </span>
    </span>
  );
}

// ========== MAIN COMPONENT ==========
export default function PlayPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { isConnected } = useAccount();
  const { enter, isPending: enterPending, hash: enterHash, error: enterError, isConfirming: enterConfirming } = useEnterTournament();
  const { submit, isPending: submitPending, hash: submitHash, error: submitError, isConfirming: submitConfirming } = useSubmitBracket();

  const [picks, setPicks] = useState<Record<number, string>>({});
  const [predictions, setPredictions] = useState<
    Record<number, QVACPrediction>
  >({});
  const [modelReady, setModelReady] = useState(false);

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Demo: assume entered after clicking enter (for stepper demo)
  const [hasEntered, setHasEntered] = useState(false);
  const [picksLocked, setPicksLocked] = useState(false);

  // Live match commentary state
  // Generate all commentary once on mount, store per match
  const allLiveCommentary = useMemo(() => {
    return DEMO_LIVE_MATCHES.map((match) =>
      generateFullMatchCommentary(match.homeTeam.name, match.awayTeam.name),
    );
  }, []);

  const [liveMinutes, setLiveMinutes] = useState<Record<number, number>>({});

  // Filter commentary by current minute for each live match
  const liveCommentary = useMemo(() => {
    const result: Record<number, CommentaryEvent[]> = {};
    DEMO_LIVE_MATCHES.forEach((match, idx) => {
      const minute = liveMinutes[idx] ?? match.currentMinute;
      result[idx] = allLiveCommentary[idx].filter(
        (e) => e.minute <= minute,
      );
    });
    return result;
  }, [liveMinutes, allLiveCommentary]);

  // Fade-in animation on mount
  const [pageVisible, setPageVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setPageVisible(true));
  }, []);

  // Toast helpers
  const addToast = useCallback(
    (type: ToastType, message: string) => {
      toastIdRef.current += 1;
      const id = toastIdRef.current;
      setToasts((t) => [...t, { id, type, message }]);
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 5000);
    },
    [],
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // Load QVAC model on mount
  useEffect(() => {
    loadPredictionModel().then(() => setModelReady(true));
  }, []);

  // Track enter transaction
  useEffect(() => {
    if (enterPending && enterHash) {
      addToast("pending", "Enter transaction submitted...");
    }
  }, [enterPending, enterHash, addToast]);

  useEffect(() => {
    if (!enterPending && !enterConfirming && enterHash && !enterError) {
      addToast("success", "Successfully entered the tournament!");
      setHasEntered(true);
    }
  }, [enterPending, enterConfirming, enterHash, enterError, addToast]);

  useEffect(() => {
    if (enterError) {
      addToast("error", `Enter failed: ${enterError.message}`);
    }
  }, [enterError, addToast]);

  // Track submit transaction
  useEffect(() => {
    if (submitPending && submitHash) {
      addToast("pending", "Submitting your picks...");
    }
  }, [submitPending, submitHash, addToast]);

  useEffect(() => {
    if (!submitPending && !submitConfirming && submitHash && !submitError) {
      addToast("success", "Picks locked!");
      setPicksLocked(true);
    }
  }, [submitPending, submitConfirming, submitHash, submitError, addToast]);

  useEffect(() => {
    if (submitError) {
      addToast("error", `Submit failed: ${submitError.message}`);
    }
  }, [submitError, addToast]);

  // Simulate live match commentary advancing
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMinutes((prev) => {
        const next = { ...prev };
        DEMO_LIVE_MATCHES.forEach((match, idx) => {
          if (match.status !== "live") return;
          const current = prev[idx] ?? match.currentMinute;
          if (current >= 90) return;
          next[idx] = current + 1;
        });
        return next;
      });
    }, 5000); // Advance every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // totalPicks derived early for stepper and submit logic
  const totalPicks = Object.keys(picks).length;

  // Determine current stepper step
  const currentStep = useMemo(() => {
    if (picksLocked) return 3;
    if (hasEntered && totalPicks > 0) return 2;
    if (hasEntered) return 1;
    return 0;
  }, [hasEntered, picksLocked, totalPicks]);

  // Build bracket rounds from World Cup 2026 data
  const rounds = useMemo(() => {
    // R16: 8 matches from our WC2026 bracket (first 8)
    const r16Teams = WC2026_R16.slice(0, 8);
    const r1: BracketMatch[] = r16Teams.map((m, i) => ({
      id: i,
      homeTeam: m.home,
      awayTeam: m.away,
      winner: null,
      resolved: false,
      picks: picks[i] ? { pickedWinner: picks[i] } : null,
    }));

    // QF: 4 matches — winners from r16
    const r2: BracketMatch[] = [0, 1, 2, 3, 4, 5, 6, 7]
      .filter((_, i) => i % 2 === 0)
      .map((idx, i) => {
        const w = picks[idx];
        return {
          id: 8 + i,
          homeTeam: w || `Winner R16-${Math.floor(idx / 2) + 1}`,
          awayTeam: "TBD",
          winner: null,
          resolved: false,
          picks: picks[8 + i] ? { pickedWinner: picks[8 + i] } : null,
        };
      });

    // SF: 2 matches
    const r3: BracketMatch[] = [0, 1].map((i) => ({
      id: 12 + i,
      homeTeam: picks[8 + i] || `Winner QF-${i + 1}`,
      awayTeam: picks[10 + i] || `Winner QF-${i + 2}`,
      winner: null,
      resolved: false,
      picks: picks[12 + i] ? { pickedWinner: picks[12 + i] } : null,
    }));

    // Final: 1 match
    const r4: BracketMatch[] = [
      {
        id: 14,
        homeTeam: picks[12] || "Winner SF-1",
        awayTeam: picks[13] || "Winner SF-2",
        winner: null,
        resolved: false,
        picks: picks[14] ? { pickedWinner: picks[14] } : null,
      },
    ];

    return [
      { label: "R16", matches: r1 },
      { label: "QF", matches: r2 },
      { label: "SF", matches: r3 },
      { label: "Final", matches: r4 },
    ];
  }, [picks]);

  // Auto-predict matches that have real team names
  useEffect(() => {
    if (!modelReady) return;

    WC2026_R16.forEach((m, i) => {
      if (!predictions[i]) {
        predictMatch(m.home, m.away).then((pred) => {
          setPredictions((prev) => ({ ...prev, [i]: pred }));
        });
      }
    });
  }, [modelReady, predictions]);

  // Handle pick
  const handlePick = useCallback((matchId: number, team: string) => {
    setPicks((prev) => ({ ...prev, [matchId]: team }));
  }, []);

  // Submit picks on-chain for Round 0 (R16)
  const handleSubmit = useCallback(() => {
    const r16Teams = WC2026_R16.slice(0, 8);
    // Convert picks to match indices for the contract
    // 0 = home wins, 1 = away wins
    const pickIndices = r16Teams.map((m, i) => {
      const p = picks[i];
      if (!p) return 0;
      return p === m.home ? 0 : 1;
    });
    submit(0, 0, pickIndices); // tournamentId=0, round=0 (R16)
  }, [picks, submit]);

  // ---------- Not connected ----------
  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-slate-400">Loading...</p></div>;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <span className="text-7xl mb-6 animate-bounce">⚽</span>
        <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          Link your wallet to enter the World Cup 2026 tournament and start
          making bracket predictions.
        </p>
        <ConnectKitButton />
      </div>
    );
  }

  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8 transition-opacity duration-700 ${
        pageVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Progress Stepper - horizontally scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <ProgressStepper currentStep={currentStep} />
      </div>

      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            World Cup 2026 Bracket
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Pick winners for each knockout match. Use QVAC AI predictions to
            guide your choices, or trust your gut!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {totalPicks}/{WC2026_R16.length + 6} picks
          </span>
          <button
            onClick={handleSubmit}
            disabled={submitPending || totalPicks === 0}
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-400/30 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {submitPending ? "Submitting..." : "Lock Picks"}
          </button>
        </div>
      </div>

      {/* Entry fee banner with tooltip */}
      <div className="mb-6 rounded-xl border border-amber-700/40 bg-amber-900/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300 inline-flex items-center gap-1.5">
              Entry Fee
              <HelpTooltip text="The amount you deposit to enter. This goes into the prize pool." />
            </p>
            <p className="text-xs text-slate-400">
              Deposit USDT to enter the tournament. Pool payout per round: 50%
              R16, 25% QF, 15% SF, 10% Final.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setHasEntered(true);
            enter(0); // contract reads entryFee internally
          }}
          disabled={enterPending || hasEntered}
          className="sm:ml-auto rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-amber-500 hover:scale-105 active:scale-95 disabled:opacity-40 min-h-12 disabled:hover:scale-100"
        >
          {enterPending ? "Depositing..." : hasEntered ? "Entered" : "Enter ($10 USDT)"}
        </button>
      </div>

      {/* ---------- Live Match Feed ---------- */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white inline-flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            Live Match Feed
          </h2>
          <HelpTooltip text="Watch AI-generated live commentary from ongoing World Cup 2026 matches." />
        </div>
        <p className="text-slate-400 mb-4 text-sm">
          Real-time match updates powered by QVAC AI commentary.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {DEMO_LIVE_MATCHES.map((match, idx) => {
            const isLive = match.status === "live";
            return (
              <div
                key={idx}
                className={`animate-fade-in-up ${
                  idx === 0
                    ? "animation-delay-0"
                    : idx === 1
                    ? "animation-delay-100"
                    : "animation-delay-200"
                }`}
              >
                {/* Live badge */}
                {isLive && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      Live — {formatMatchMinute(liveMinutes[idx] ?? match.currentMinute)}
                    </span>
                  </div>
                )}
                {match.status === "finished" && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Full Time
                    </span>
                  </div>
                )}
                <LiveMatchFeed
                  homeTeam={match.homeTeam}
                  awayTeam={match.awayTeam}
                  status={match.status}
                  currentMinute={liveMinutes[idx] ?? match.currentMinute}
                  events={liveCommentary[idx] ?? []}
                  predictions={match.predictions}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bracket - collapsible on very small screens */}
      <div className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
          Knockout Bracket
        </h2>
        <p className="text-slate-400 mb-4 text-sm">
          Select your winners for each round. All 48 World Cup 2026 qualified
          teams across 12 groups compete in the knockout stage.
        </p>
        <details className="mb-6 sm:mb-0 sm:contents">
          <summary className="sm:hidden cursor-pointer text-sm font-semibold text-emerald-400 mb-3 select-none">
            View Bracket
          </summary>
          <div className="animate-fade-in-up animation-delay-300">
            <BracketVisual rounds={rounds} onPick={handlePick} />
          </div>
        </details>
      </div>

      {/* AI Predictions panel with tooltip */}
      <div className="mt-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 inline-flex items-center gap-2">
          QVAC AI Predictions
          <HelpTooltip text="Powered by QVAC, runs locally on your device. No cloud APIs." />
        </h2>
        <p className="text-slate-400 mb-6 text-sm">
          AI-generated win probabilities for each World Cup 2026 knockout matchup.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WC2026_R16.map((m, i) => {
            const pred: QVACPrediction | undefined = predictions[i];
            return (
              <div
                key={i}
                className="rounded-xl border border-slate-700 bg-slate-900/50 p-3 transition-all duration-300 hover:border-slate-500 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-slate-900/50 animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="mb-2 text-center text-xs sm:text-sm font-semibold text-slate-200">
                  {m.home} vs {m.away}
                </div>
                <AIPrediction
                  prediction={
                    pred
                      ? {
                          homeTeam: m.home,
                          awayTeam: m.away,
                          homeWinPct: pred.homeWinPct,
                          drawPct: pred.drawPct,
                          awayWinPct: pred.awayWinPct,
                          predictedWinner: pred.predictedWinner,
                          confidence: pred.confidence,
                          loading: false,
                        }
                      : null
                  }
                  loading={!modelReady || !pred}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile sticky Lock Picks button */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700 bg-slate-950/95 backdrop-blur-md p-4">
        <button
          onClick={handleSubmit}
          disabled={submitPending || totalPicks === 0}
          className="w-full rounded-xl bg-emerald-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed min-h-12"
        >
          {submitPending ? "Submitting..." : `Lock Picks (${totalPicks}/${WC2026_R16.length + 6})`}
        </button>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

// ---------- Helper ----------
function formatMatchMinute(minute: number): string {
  if (minute > 45 && minute <= 50) return `45+${minute - 45}`;
  if (minute > 90 && minute <= 95) return `90+${minute - 90}`;
  return `${minute}'`;
}

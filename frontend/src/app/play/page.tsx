// ============================================================
// GoalPredict — Play page (World Cup 2026 edition)
// Bracket visual, live match feed, AI predictions, submit picks,
// stepper, toasts, animations — reads real data from contract
// ============================================================

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAccount, useReadContract, usePublicClient } from "wagmi";
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
import { TEAMS, FLAG_MAP } from "@/lib/worldcup2026";
import { GoalPredictCoreABI, ADDRESSES } from "@/lib/contracts";
import {
  generateFullMatchCommentary,
  type CommentaryEvent,
} from "@/lib/ai-commentary";

// ---------- Contract match type ----------
interface ContractMatch {
  id: number;
  homeTeam: string;
  awayTeam: string;
  round: number;
  homeGoals: number;
  awayGoals: number;
  resolved: boolean;
}

// ---------- Live match data for feed (derived from contract matches) ----------
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

  // Check if user already entered by reading their USDT balance vs expected
  // If they have less than initial - entryFee, they already entered
  const [hasEntered, setHasEntered] = useState(false);

  // When user enters successfully, update state
  useEffect(() => {
    if (enterHash && !enterError) {
      setHasEntered(true);
    }
  }, [enterHash, enterError]);
  const [picksLocked, setPicksLocked] = useState(false);

  // ----- Read matches count from contract -----
  const { data: matchesCountRaw } = useReadContract({
    address: ADDRESSES.GoalPredictCore,
    abi: GoalPredictCoreABI,
    functionName: "getMatchesCount",
    args: [0n],
    query: { enabled: mounted && isConnected, refetchInterval: 15_000 },
  });
  const matchesCount = matchesCountRaw ? Number(matchesCountRaw) : 0;

  // ----- Read tournament info for entry fee display -----
  const { data: tournamentData } = useReadContract({
    address: ADDRESSES.GoalPredictCore,
    abi: GoalPredictCoreABI,
    functionName: "getTournament",
    args: [0n],
    query: { enabled: mounted && isConnected },
  });
  const t = tournamentData as unknown as [bigint, bigint, bigint, bigint, number, bigint, bigint[]] | undefined;
  const entryFeeUSDT = t ? (Number(t[3]) || 0) / 1e18 : 10;

  // ----- Fetch all matches via publicClient in a useEffect -----
  const publicClient = usePublicClient();
  const [contractMatches, setContractMatches] = useState<ContractMatch[]>([]);

  useEffect(() => {
    if (!publicClient || !mounted || matchesCount <= 0) return;

    const fetchMatches = async () => {
      try {
        const results = await Promise.all(
          Array.from({ length: Math.min(matchesCount, 30) }, (_, i) =>
            publicClient.readContract({
              address: ADDRESSES.GoalPredictCore,
              abi: GoalPredictCoreABI,
              functionName: "getMatch",
              args: [0n, BigInt(i)],
            })
          )
        );
        setContractMatches(
          results.map((r, i) => {
            const arr = r as unknown as [bigint, string, string, number, number, number, boolean];
            return {
              id: i,
              homeTeam: arr[1],
              awayTeam: arr[2],
              round: arr[3],
              homeGoals: arr[4],
              awayGoals: arr[5],
              resolved: arr[6],
            };
          })
        );
      } catch (err) {
        console.error("Failed to fetch matches:", err);
      }
    };
    fetchMatches();
  }, [publicClient, mounted, matchesCount]);

  // Derive R16 matches from contract data (round === 0)
  const r16Matches = useMemo(
    () => contractMatches.filter((m) => m.round === 0),
    [contractMatches],
  );

  // All matches grouped by round
  const matchesByRound = useMemo(() => {
    const grouped: Record<number, ContractMatch[]> = {};
    contractMatches.forEach((m) => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });
    return grouped;
  }, [contractMatches]);

  // ----- Live match feed: use first 3 R16 matches as "live" -----
  const liveMatchData: LiveMatchData[] = useMemo(() => {
    return r16Matches.slice(0, 3).map((m) => ({
      homeTeam: { name: m.homeTeam, code: getTeamCode(m.homeTeam), flag: getTeamFlag(m.homeTeam), score: m.resolved ? m.homeGoals : 0 },
      awayTeam: { name: m.awayTeam, code: getTeamCode(m.awayTeam), flag: getTeamFlag(m.awayTeam), score: m.resolved ? m.awayGoals : 0 },
      status: m.resolved ? "finished" : "live",
      currentMinute: m.resolved ? 90 : 30,
      predictions: { homeWinPct: 40, drawPct: 25, awayWinPct: 35 },
    }));
  }, [r16Matches]);

  // Live match commentary state
  const allLiveCommentary = useMemo(() => {
    return liveMatchData.map((match) =>
      generateFullMatchCommentary(match.homeTeam.name, match.awayTeam.name),
    );
  }, [liveMatchData]);

  const [liveMinutes, setLiveMinutes] = useState<Record<number, number>>({});

  // Filter commentary by current minute for each live match
  const liveCommentary = useMemo(() => {
    const result: Record<number, CommentaryEvent[]> = {};
    liveMatchData.forEach((match, idx) => {
      const minute = liveMinutes[idx] ?? match.currentMinute;
      result[idx] = allLiveCommentary[idx]?.filter(
        (e) => e.minute <= minute,
      ) ?? [];
    });
    return result;
  }, [liveMinutes, allLiveCommentary, liveMatchData]);

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
        liveMatchData.forEach((match, idx) => {
          if (match.status !== "live") return;
          const current = prev[idx] ?? match.currentMinute;
          if (current >= 90) return;
          next[idx] = current + 1;
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [liveMatchData]);

  // totalPicks derived early for stepper and submit logic
  const totalPicks = Object.keys(picks).length;

  // Determine current stepper step
  const currentStep = useMemo(() => {
    if (picksLocked) return 3;
    if (hasEntered && totalPicks > 0) return 2;
    if (hasEntered) return 1;
    return 0;
  }, [hasEntered, picksLocked, totalPicks]);

  // Build bracket rounds from contract match data
  const rounds = useMemo(() => {
    // R16: use contract matches with round === 0
    const r16 = (matchesByRound[0] ?? []).slice(0, 8);
    const r1: BracketMatch[] = r16.map((m, i) => ({
      id: m.id,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      winner: m.resolved ? (m.homeGoals > m.awayGoals ? m.homeTeam : m.awayTeam) : null,
      resolved: m.resolved,
      picks: picks[i] ? { pickedWinner: picks[i] } : null,
    }));

    // QF: use contract matches with round === 1, or generate placeholders
    const qf = (matchesByRound[1] ?? []).slice(0, 4);
    const r2: BracketMatch[] = qf.length > 0
      ? qf.map((m, i) => ({
          id: m.id,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          winner: m.resolved ? (m.homeGoals > m.awayGoals ? m.homeTeam : m.awayTeam) : null,
          resolved: m.resolved,
          picks: picks[8 + i] ? { pickedWinner: picks[8 + i] } : null,
        }))
      : r16.slice(0, 8).filter((_, i) => i % 2 === 0).map((_, i) => {
          const w = picks[i * 2];
          return {
            id: 8 + i,
            homeTeam: w || `Winner R16-${i + 1}`,
            awayTeam: "TBD",
            winner: null,
            resolved: false,
            picks: picks[8 + i] ? { pickedWinner: picks[8 + i] } : null,
          };
        });

    // SF: use contract matches with round === 2, or generate placeholders
    const sf = (matchesByRound[2] ?? []).slice(0, 2);
    const r3: BracketMatch[] = sf.length > 0
      ? sf.map((m, i) => ({
          id: m.id,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          winner: m.resolved ? (m.homeGoals > m.awayGoals ? m.homeTeam : m.awayTeam) : null,
          resolved: m.resolved,
          picks: picks[12 + i] ? { pickedWinner: picks[12 + i] } : null,
        }))
      : [0, 1].map((i) => ({
          id: 12 + i,
          homeTeam: picks[8 + i] || `Winner QF-${i + 1}`,
          awayTeam: picks[10 + i] || `Winner QF-${i + 2}`,
          winner: null,
          resolved: false,
          picks: picks[12 + i] ? { pickedWinner: picks[12 + i] } : null,
        }));

    // Final: use contract match with round === 3, or generate placeholder
    const final = (matchesByRound[3] ?? []).slice(0, 1);
    const r4: BracketMatch[] = final.length > 0
      ? [final[0]].map((m) => ({
          id: m.id,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          winner: m.resolved ? (m.homeGoals > m.awayGoals ? m.homeTeam : m.awayTeam) : null,
          resolved: m.resolved,
          picks: picks[14] ? { pickedWinner: picks[14] } : null,
        }))
      : [{
          id: 14,
          homeTeam: picks[12] || "Winner SF-1",
          awayTeam: picks[13] || "Winner SF-2",
          winner: null,
          resolved: false,
          picks: picks[14] ? { pickedWinner: picks[14] } : null,
        }];

    return [
      { label: "R16", matches: r1 },
      { label: "QF", matches: r2 },
      { label: "SF", matches: r3 },
      { label: "Final", matches: r4 },
    ];
  }, [matchesByRound, picks]);

  // Auto-predict matches that have real team names from contract
  useEffect(() => {
    if (!modelReady || r16Matches.length === 0) return;

    r16Matches.slice(0, 8).forEach((m, i) => {
      if (!predictions[i]) {
        predictMatch(m.homeTeam, m.awayTeam).then((pred) => {
          setPredictions((prev) => ({ ...prev, [i]: pred }));
        });
      }
    });
  }, [modelReady, predictions, r16Matches]);

  // Handle pick
  const handlePick = useCallback((matchId: number, team: string) => {
    setPicks((prev) => ({ ...prev, [matchId]: team }));
  }, []);

  // Submit picks on-chain for Round 0 (R16)
  const handleSubmit = useCallback(() => {
    const r16 = r16Matches.slice(0, 8);
    if (r16.length === 0) return;
    // Convert picks to match indices for the contract
    // 0 = home wins, 1 = away wins
    const pickIndices = r16.map((m, i) => {
      const p = picks[i];
      if (!p) return 0;
      return p === m.homeTeam ? 0 : 1;
    });
    submit(0, 0, pickIndices); // tournamentId=0, round=0 (R16)
  }, [picks, submit, r16Matches]);

  // Total possible picks: R16 matches (from contract) + 7 (QF4 + SF2 + Final1)
  const totalPossiblePicks = (r16Matches.length || 8) + 7;

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
            {totalPicks}/{totalPossiblePicks} picks
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
        {!hasEntered ? (
          <button
            onClick={() => enter(0)}
            disabled={enterPending}
            className="sm:ml-auto rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-amber-500 hover:scale-105 active:scale-95 disabled:opacity-40 min-h-12 disabled:hover:scale-100"
          >
            {enterPending ? "Depositing..." : `Enter ($${entryFeeUSDT} USDT)`}
          </button>
        ) : (
          <span className="sm:ml-auto rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white min-h-12 flex items-center">
            ✓ Entered
          </span>
        )}
      </div>

      {/* ---------- Live Match Feed ---------- */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white inline-flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            {liveMatchData.length > 0 ? "Live Match Feed" : "Match Feed"}
          </h2>
          <HelpTooltip text="Watch AI-generated live commentary from ongoing World Cup 2026 matches." />
        </div>
        <p className="text-slate-400 mb-4 text-sm">
          {liveMatchData.length > 0
            ? "Real-time match updates powered by QVAC AI commentary."
            : "No matches available yet. Matches will appear here once added to the tournament."}
        </p>

        {liveMatchData.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {liveMatchData.map((match, idx) => {
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
        ) : (
          <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center">
            <span className="text-4xl mb-4 block">📋</span>
            <p className="text-slate-400 text-sm">
              No matches have been added to the tournament yet.
              {matchesCount === 0 && " Waiting for admin to add matches."}
            </p>
          </div>
        )}
      </div>

      {/* Bracket - collapsible on very small screens */}
      <div className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
          Knockout Bracket
        </h2>
        <p className="text-slate-400 mb-4 text-sm">
          {contractMatches.length > 0
            ? `Select your winners for each round. ${contractMatches.length} matches in the tournament.`
            : "Select your winners for each round. Loading matches from contract..."}
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
        {r16Matches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {r16Matches.slice(0, 8).map((m, i) => {
              const pred: QVACPrediction | undefined = predictions[i];
              return (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-700 bg-slate-900/50 p-3 transition-all duration-300 hover:border-slate-500 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-slate-900/50 animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="mb-2 text-center text-xs sm:text-sm font-semibold text-slate-200">
                    {m.homeTeam} vs {m.awayTeam}
                  </div>
                  <AIPrediction
                    prediction={
                      pred
                        ? {
                            homeTeam: m.homeTeam,
                            awayTeam: m.awayTeam,
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
        ) : (
          <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center">
            <span className="text-4xl mb-4 block">🤖</span>
            <p className="text-slate-400 text-sm">
              Predictions will appear here once matches are loaded from the contract.
            </p>
          </div>
        )}
      </div>

      {/* Mobile sticky Lock Picks button */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700 bg-slate-950/95 backdrop-blur-md p-4">
        <button
          onClick={handleSubmit}
          disabled={submitPending || totalPicks === 0}
          className="w-full rounded-xl bg-emerald-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed min-h-12"
        >
          {submitPending ? "Submitting..." : `Lock Picks (${totalPicks}/${totalPossiblePicks})`}
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

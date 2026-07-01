// ============================================================
// GoalPredict — Play page
// Bracket visual, AI predictions, submit picks
// ============================================================

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import BracketVisual, { type BracketMatch } from "@/components/BracketVisual";
import AIPrediction from "@/components/AIPrediction";
import { useEnterTournament, useSubmitBracket } from "@/hooks/useGoalPredict";
import {
  predictMatch,
  loadPredictionModel,
  type QVACPrediction,
} from "@/lib/qvac";

// ---------- demo bracket data ----------
const DEMO_TEAMS: { home: string; away: string }[] = [
  { home: "Brazil", away: "South Korea" },
  { home: "Japan", away: "Croatia" },
  { home: "Morocco", away: "Spain" },
  { home: "Argentina", away: "Australia" },
  { home: "France", away: "Poland" },
  { home: "England", away: "Senegal" },
  { home: "Portugal", away: "Switzerland" },
  { home: "Netherlands", away: "USA" },
];

// Rounds are tracked in the bracket component

export default function PlayPage() {
  const { isConnected } = useAccount();
  const { enter, isPending: enterPending } = useEnterTournament();
  const { submit, isPending: submitPending } = useSubmitBracket();

  const [picks, setPicks] = useState<Record<number, string>>({});
  const [predictions, setPredictions] = useState<
    Record<number, QVACPrediction>
  >({});
  const [modelReady, setModelReady] = useState(false);

  // Load QVAC model on mount
  useEffect(() => {
    loadPredictionModel().then(() => setModelReady(true));
  }, []);

  // Build bracket rounds from demo data
  const rounds = useMemo(() => {
    // Round 1: 8 matches
    const r1: BracketMatch[] = DEMO_TEAMS.map((m, i) => ({
      id: i,
      homeTeam: m.home,
      awayTeam: m.away,
      winner: null,
      resolved: false,
      picks: picks[i] ? { pickedWinner: picks[i] } : null,
    }));

    // QF: 4 matches — winners from r1
    const r2: BracketMatch[] = [0, 1, 2, 3, 4, 5, 6, 7]
      .filter((_, i) => i % 2 === 0)
      .map((idx, i) => {
        const w = picks[idx];
        return {
          id: 8 + i,
          homeTeam: w || `Winner R1-${Math.floor(idx / 2) + 1}`,
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

    DEMO_TEAMS.forEach((m, i) => {
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
    // Convert picks to match indices for the contract
    // 0 = home wins, 1 = away wins
    const pickIndices = DEMO_TEAMS.map((m, i) => {
      const p = picks[i];
      if (!p) return 0;
      return p === m.home ? 0 : 1;
    });
    submit(0, 0, pickIndices); // tournamentId=0, round=0 (R16)
  }, [picks, submit]);

  const totalPicks = Object.keys(picks).length;

  // ---------- Not connected ----------
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <span className="text-7xl mb-6">⚽</span>
        <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          Link your wallet to enter the tournament and start making bracket
          predictions.
        </p>
        <ConnectKitButton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Bracket</h1>
          <p className="text-slate-400 mt-1">
            Pick winners for each match. Use QVAC AI predictions to guide your
            choices, or trust your gut!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {totalPicks}/{DEMO_TEAMS.length + 4} picks
          </span>
          <button
            onClick={handleSubmit}
            disabled={submitPending || totalPicks === 0}
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitPending ? "Submitting..." : "Lock Picks"}
          </button>
        </div>
      </div>

      {/* Entry fee banner */}
      <div className="mb-6 rounded-xl border border-amber-700/40 bg-amber-900/20 p-4 flex items-center gap-3">
        <span className="text-2xl">💰</span>
        <div>
          <p className="text-sm font-semibold text-amber-300">Entry Fee</p>
          <p className="text-xs text-slate-400">
            Deposit USDT to enter the tournament. Pool payout per round: 50%
            R16, 25% QF, 15% SF, 10% Final.
          </p>
        </div>
        <button
          onClick={() => enter(0)} // contract reads entryFee internally
          disabled={enterPending}
          className="ml-auto rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-500 disabled:opacity-40"
        >
          {enterPending ? "Depositing..." : "Enter ($10 USDT)"}
        </button>
      </div>

      {/* Bracket */}
      <BracketVisual rounds={rounds} onPick={handlePick} />

      {/* AI Predictions panel */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-white mb-4">
          QVAC AI Predictions
        </h2>
        <p className="text-slate-400 mb-6 text-sm">
          AI-generated win probabilities for each first-round matchup.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_TEAMS.map((m, i) => {
            const pred: QVACPrediction | undefined = predictions[i];
            return (
              <div key={i} className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                <div className="mb-2 text-center text-sm font-semibold text-slate-200">
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
    </div>
  );
}

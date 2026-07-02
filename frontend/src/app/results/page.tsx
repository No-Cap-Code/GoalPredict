// ============================================================
// GoalPredict — Results page
// Resolved rounds, user scorecard, claim winnings, leaderboard
// Reads real data from the GoalPredictCore contract
// ============================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import { useAccount, useReadContract, usePublicClient } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useClaimPayout } from "@/hooks/useGoalPredict";
import { GoalPredictCoreABI, ADDRESSES } from "@/lib/contracts";

const ROUND_LABELS = ["R16", "QF", "SF", "Final"] as const;

interface ContractMatch {
  id: number;
  homeTeam: string;
  awayTeam: string;
  round: number;
  homeGoals: number;
  awayGoals: number;
  resolved: boolean;
}

export default function ResultsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { isConnected, address } = useAccount();
  const { claim, isPending, error } = useClaimPayout();
  const publicClient = usePublicClient();

  const canClaim = isConnected && address;

  // ----- Read matches count from contract -----
  const { data: matchesCountRaw } = useReadContract({
    address: ADDRESSES.GoalPredictCore,
    abi: GoalPredictCoreABI,
    functionName: "getMatchesCount",
    args: [0n],
    query: { enabled: mounted && isConnected, refetchInterval: 15_000 },
  });
  const matchesCount = matchesCountRaw ? Number(matchesCountRaw) : 0;

  // ----- Fetch all matches via publicClient -----
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

  // Only resolved matches
  const resolvedMatches = useMemo(
    () => contractMatches.filter((m) => m.resolved),
    [contractMatches],
  );

  // Group resolved matches by round
  const rounds = useMemo(
    () =>
      ROUND_LABELS.map((label, idx) => ({
        label,
        matches: resolvedMatches.filter((m) => m.round === idx),
      })),
    [resolvedMatches],
  );

  const totalResolvedCount = resolvedMatches.length;
  const totalMatchCount = contractMatches.length;

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-slate-400">Loading...</p></div>;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <span className="text-7xl mb-6">🏆</span>
        <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          View your bracket results, scorecard, and claim winnings.
        </p>
        <ConnectKitButton />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Tournament Results</h1>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">
          Resolved rounds, your scorecard, and leaderboard standings.
        </p>
      </div>

      {/* Resolved Rounds */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          Resolved Rounds
        </h2>

        {totalResolvedCount === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center">
            <span className="text-4xl mb-4 block">📋</span>
            <p className="text-slate-300 font-semibold mb-2">No matches resolved yet</p>
            <p className="text-slate-400 text-sm">
              {totalMatchCount > 0
                ? `${totalMatchCount} matches are in the tournament. Results will appear here once matches are resolved.`
                : "No matches have been added to the tournament yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rounds.map((round) => (
              <div
                key={round.label}
                className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden"
              >
                <div className="bg-emerald-900/40 border-b border-slate-700 px-4 py-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                    {round.label}
                  </span>
                </div>

                <div className="divide-y divide-slate-800">
                  {round.matches.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xs sm:text-sm">
                          <span className="font-medium text-slate-200">
                            {m.homeTeam}
                          </span>
                          <span className="mx-2 text-slate-500">
                            {m.homeGoals} - {m.awayGoals}
                          </span>
                          <span className="font-medium text-slate-200">
                            {m.awayTeam}
                          </span>
                        </div>
                      </div>
                      <div className="text-right sm:text-right pl-8 sm:pl-0">
                        <div className="text-xs sm:text-sm font-bold text-emerald-400">
                          Winner: {m.homeGoals > m.awayGoals ? m.homeTeam : m.awayTeam}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* User Scorecard */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-amber-400">📊</span>
          Tournament Summary
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border-2 border-emerald-700/50 bg-emerald-900/30 p-4 sm:p-6 text-center">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-400">
              Total Matches
            </div>
            <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-emerald-300">
              {totalMatchCount}
            </div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 sm:p-6 text-center">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
              Resolved
            </div>
            <div className="mt-2 text-3xl sm:text-4xl font-bold text-white">
              {totalResolvedCount}
            </div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 sm:p-6 text-center">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
              Pending
            </div>
            <div className="mt-2 text-3xl sm:text-4xl font-bold text-white">
              {totalMatchCount - totalResolvedCount}
            </div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 sm:p-6 text-center">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
              Rounds Resolved
            </div>
            <div className="mt-2 text-3xl sm:text-4xl font-bold text-white">
              {rounds.filter((r) => r.matches.length > 0).length}/4
            </div>
          </div>
        </div>
      </section>

      {/* Claim Winnings */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-amber-400">💰</span>
          Claim Winnings
        </h2>

        <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 p-4 sm:p-6">
          {canClaim ? (
            <>
              <p className="text-slate-300 mb-4 text-sm sm:text-base">
                {totalResolvedCount > 0
                  ? <>Claim your share of the prize pool for resolved rounds.</>
                  : <>No rounds have been resolved yet. Winnings will be available after round resolution.</>}
              </p>
              <button
                onClick={() => claim(0)}
                disabled={isPending || totalResolvedCount === 0}
                className="w-full rounded-xl bg-amber-500 px-6 py-4 text-lg font-bold text-slate-900 shadow-lg transition hover:bg-amber-400 disabled:opacity-40"
              >
                {isPending ? "Claiming..." : "Claim Winnings"}
              </button>
              {error && (
                <p className="mt-3 text-sm text-rose-400">Error: {error.message}</p>
              )}
            </>
          ) : (
            <p className="text-slate-500 text-center">
              Connect your wallet to claim winnings.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
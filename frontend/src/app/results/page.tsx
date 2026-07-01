// ============================================================
// GoalPredict — Results page
// Resolved rounds, user scorecard, claim winnings, leaderboard
// ============================================================

"use client";

import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useClaimPayout } from "@/hooks/useGoalPredict";

const ROUND_LABELS = ["R16", "QF", "SF", "Final"] as const;

// Demo resolved matches
const RESOLVED_MATCHES = [
  // R16
  {
    id: 0,
    round: 0,
    homeTeam: "Brazil",
    awayTeam: "South Korea",
    winner: "Brazil",
    correct: true,
  },
  {
    id: 1,
    round: 0,
    homeTeam: "Japan",
    awayTeam: "Croatia",
    winner: "Croatia",
    correct: false,
  },
  {
    id: 2,
    round: 0,
    homeTeam: "Morocco",
    awayTeam: "Spain",
    winner: "Morocco",
    correct: true,
  },
  {
    id: 3,
    round: 0,
    homeTeam: "Argentina",
    awayTeam: "Australia",
    winner: "Argentina",
    correct: true,
  },
  {
    id: 4,
    round: 0,
    homeTeam: "France",
    awayTeam: "Poland",
    winner: "France",
    correct: true,
  },
  {
    id: 5,
    round: 0,
    homeTeam: "England",
    awayTeam: "Senegal",
    winner: "England",
    correct: true,
  },
  {
    id: 6,
    round: 0,
    homeTeam: "Portugal",
    awayTeam: "Switzerland",
    winner: "Portugal",
    correct: false,
  },
  {
    id: 7,
    round: 0,
    homeTeam: "Netherlands",
    awayTeam: "USA",
    winner: "Netherlands",
    correct: true,
  },
  // QF
  {
    id: 8,
    round: 1,
    homeTeam: "Brazil",
    awayTeam: "Croatia",
    winner: "Croatia",
    correct: false,
  },
  {
    id: 9,
    round: 1,
    homeTeam: "Morocco",
    awayTeam: "Argentina",
    winner: "Argentina",
    correct: true,
  },
  {
    id: 10,
    round: 1,
    homeTeam: "France",
    awayTeam: "England",
    winner: "France",
    correct: true,
  },
  {
    id: 11,
    round: 1,
    homeTeam: "Portugal",
    awayTeam: "Netherlands",
    winner: "Portugal",
    correct: false,
  },
  // SF
  {
    id: 12,
    round: 2,
    homeTeam: "Argentina",
    awayTeam: "France",
    winner: "Argentina",
    correct: true,
  },
  {
    id: 13,
    round: 2,
    homeTeam: "Portugal",
    awayTeam: "Croatia",
    winner: "Croatia",
    correct: false,
  },
  // Final
  {
    id: 14,
    round: 3,
    homeTeam: "Argentina",
    awayTeam: "Croatia",
    winner: "Argentina",
    correct: true,
  },
];

const LEADERBOARD = [
  { address: "0x742d...8B2A", correct: 12, earned: 850, rank: 1 },
  { address: "0x9c4e...3F1D", correct: 11, earned: 620, rank: 2 },
  { address: "0x1aB3...E7F2", correct: 10, earned: 410, rank: 3 },
  { address: "0x5e8F...4A9C", correct: 9, earned: 280, rank: 4 },
  { address: "0xB2D4...6E3A", correct: 8, earned: 190, rank: 5 },
];

export default function ResultsPage() {
  const { isConnected, address } = useAccount();
  const { claim, isPending, error } = useClaimPayout();

  const canClaim = isConnected && address;

  // Group matches by round
  const rounds = ROUND_LABELS.map((label, idx) => ({
    label,
    matches: RESOLVED_MATCHES.filter((m) => m.round === idx),
  }));

  const userCorrect = RESOLVED_MATCHES.filter((m) => m.correct).length;
  const userByRound = ROUND_LABELS.map((_, idx) =>
    RESOLVED_MATCHES.filter((m) => m.round === idx && m.correct).length
  );

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
                      <span className="text-xl">{m.correct ? "✅" : "❌"}</span>
                      <div className="text-xs sm:text-sm">
                        <span className="font-medium text-slate-200">
                          {m.homeTeam}
                        </span>
                        <span className="mx-2 text-slate-500">vs</span>
                        <span className="font-medium text-slate-200">
                          {m.awayTeam}
                        </span>
                      </div>
                    </div>
                    <div className="text-right sm:text-right pl-8 sm:pl-0">
                      <div className="text-xs sm:text-sm font-bold text-emerald-400">
                        Winner: {m.winner}
                      </div>
                      <div className="text-xs text-slate-500">
                        {m.correct ? "Correct pick" : "Incorrect"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* User Scorecard */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-amber-400">📊</span>
          Your Scorecard
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {/* Total */}
          <div className="rounded-xl border-2 border-emerald-700/50 bg-emerald-900/30 p-4 sm:p-6 text-center col-span-2 sm:col-span-2">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-400">
              Total Correct
            </div>
            <div className="mt-2 text-3xl sm:text-5xl font-extrabold text-emerald-300">
              {userCorrect}/15
            </div>
            <div className="mt-2 text-xs sm:text-sm text-slate-400">
              {Math.round((userCorrect / 15) * 100)}% accuracy
            </div>
          </div>

          {/* Per round */}
          {userByRound.map((correct, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-700 bg-slate-800/50 p-3 sm:p-4 text-center"
            >
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
                {ROUND_LABELS[idx]}
              </div>
              <div className="mt-1 text-xl sm:text-2xl font-bold text-white">{correct}</div>
              <div className="text-[10px] sm:text-xs text-slate-500">
                /{rounds[idx].matches.length}
              </div>
            </div>
          ))}
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
                You have <span className="font-bold text-amber-300">
                  {userCorrect} correct picks
                </span>{" "}
                across all resolved rounds. Claim your share of the prize pool.
              </p>
              <button
                onClick={() => claim(0)}
                disabled={isPending}
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

      {/* Leaderboard */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-emerald-400">🏅</span>
          Leaderboard
        </h2>

        {/* Desktop table */}
        <div className="hidden sm:block rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                  Address
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-slate-400">
                  Correct
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-slate-400">
                  Earned (USDT)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {LEADERBOARD.map((entry) => (
                <tr key={entry.address} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <span
                      className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                        ${
                          entry.rank === 1
                            ? "bg-amber-500 text-slate-900"
                            : entry.rank === 2
                            ? "bg-slate-400 text-slate-900"
                            : entry.rank === 3
                            ? "bg-amber-700 text-slate-900"
                            : "bg-slate-700 text-slate-200"
                        }
                      `}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">
                    {entry.address}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-400">
                    {entry.correct}/15
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-amber-300">
                    {entry.earned.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card layout */}
        <div className="sm:hidden space-y-3">
          {LEADERBOARD.map((entry) => (
            <div
              key={entry.address}
              className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 flex items-center gap-4"
            >
              <span
                className={`
                  inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold flex-shrink-0
                  ${
                    entry.rank === 1
                      ? "bg-amber-500 text-slate-900"
                      : entry.rank === 2
                      ? "bg-slate-400 text-slate-900"
                      : entry.rank === 3
                      ? "bg-amber-700 text-slate-900"
                      : "bg-slate-700 text-slate-200"
                  }
                `}
              >
                {entry.rank}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-slate-300 truncate">
                  {entry.address}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs font-bold text-emerald-400">
                    {entry.correct}/15 correct
                  </span>
                  <span className="text-xs font-bold text-amber-300">
                    {entry.earned.toLocaleString()} USDT
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
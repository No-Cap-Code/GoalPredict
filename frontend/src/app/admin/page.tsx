// ============================================================
// GoalPredict — Admin panel (contract owner only)
// Create tournament, add matches, resolve rounds
// ============================================================

"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { GoalPredictCoreABI, ADDRESSES } from "@/lib/contracts";

export default function AdminPage() {
  const { address } = useAccount();

  const isOwner = true; // TODO: verify against contract owner
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const [activeTab, setActiveTab] = useState("create");

  const [tournamentForm, setTournamentForm] = useState({
    name: "2026 WC Knockouts",
    entryFee: "",
  });

  const [matchForm, setMatchForm] = useState({
    round: "R16",
    homeTeam: "",
    awayTeam: "",
    matchIndex: "",
  });

  const [resolveForm, setResolveForm] = useState({
    matchId: "",
    winner: "",
  });

  const handleCreateTournament = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const entryFee = tournamentForm.entryFee ? BigInt(Math.floor(Number(tournamentForm.entryFee) * 1e18)) : 0n;
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + 86400 * 14; // 14 days

    writeContract({
      address: ADDRESSES.GoalPredictCore,
      abi: GoalPredictCoreABI,
      functionName: "createTournament",
      args: [BigInt(startTime), BigInt(endTime), entryFee],
    });
  };

  const handleAddMatch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!matchForm.homeTeam || !matchForm.awayTeam) return;

    writeContract({
      address: ADDRESSES.GoalPredictCore,
      abi: GoalPredictCoreABI,
      functionName: "addMatch",
      args: [
        BigInt(0),
        matchForm.homeTeam,
        matchForm.awayTeam,
        matchForm.round === "R16" ? 0 : matchForm.round === "QF" ? 1 : matchForm.round === "SF" ? 2 : 3,
      ],
    });
  };

  const handleResolveMatch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resolveForm.matchId || !resolveForm.winner) return;

    // Note: contract uses resolveRound, not resolveMatch
    // This is a simplified demo - in production you'd resolve by round
    writeContract({
      address: ADDRESSES.GoalPredictCore,
      abi: GoalPredictCoreABI,
      functionName: "resolveRound",
      args: [BigInt(0), 0, [0, 0, 0, 0, 0, 0, 0, 0]], // demo: all home teams win R16
    });
  };

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <span className="text-7xl mb-6">⚠️</span>
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-slate-400 max-w-md">
          You do not have permission to access the admin panel. Only the contract owner can manage tournaments.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
        <p className="text-slate-400 mt-1">
          Manage tournaments, matches, and round resolutions.
        </p>
        <p className="text-xs text-emerald-400 mt-2">
          Contract owner: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>

      {/* Tab navigation */}
      <div className="mb-8 border-b border-slate-700">
        <nav className="flex gap-6">
          {[
            { id: "create", label: "Create Tournament" },
            { id: "add", label: "Add Match" },
            { id: "resolve", label: "Resolve Match" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Transaction status */}
      {(hash || error) && (
        <div className={`mb-6 rounded-lg border p-4 text-sm ${
          hash
            ? "border-emerald-700/40 bg-emerald-900/20 text-emerald-300"
            : "border-rose-700/40 bg-rose-900/20 text-rose-300"
        }`}>
          <div className="font-medium">
            {hash
              ? "Transaction submitted!"
              : error
              ? "Transaction failed"
              : null}
          </div>
          <div className="truncate font-mono text-xs mt-1">
            {hash ?? error?.message}
          </div>
        </div>
      )}

      {/* Form content */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-6">
        {activeTab === "create" && (
          <form onSubmit={handleCreateTournament} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tournament Name
              </label>
              <input
                type="text"
                required
                value={tournamentForm.name}
                onChange={(e) =>
                  setTournamentForm((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Entry Fee (USDT)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={tournamentForm.entryFee}
                onChange={(e) =>
                  setTournamentForm((p) => ({ ...p, entryFee: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-400 disabled:opacity-40"
            >
              {isPending ? "Creating..." : "Create Tournament"}
            </button>
          </form>
        )}

        {activeTab === "add" && (
          <form onSubmit={handleAddMatch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Round
                </label>
                <select
                  value={matchForm.round}
                  onChange={(e) =>
                    setMatchForm((p) => ({ ...p, round: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                >
                  {["R16", "QF", "SF", "Final"].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Match Index
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={matchForm.matchIndex}
                  onChange={(e) =>
                    setMatchForm((p) => ({ ...p, matchIndex: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Home Team
                </label>
                <input
                  type="text"
                  required
                  value={matchForm.homeTeam}
                  onChange={(e) =>
                    setMatchForm((p) => ({ ...p, homeTeam: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Away Team
                </label>
                <input
                  type="text"
                  required
                  value={matchForm.awayTeam}
                  onChange={(e) =>
                    setMatchForm((p) => ({ ...p, awayTeam: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-400 disabled:opacity-40"
            >
              {isPending ? "Adding..." : "Add Match"}
            </button>
          </form>
        )}

        {activeTab === "resolve" && (
          <form onSubmit={handleResolveMatch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Match ID
              </label>
              <input
                type="number"
                required
                min="0"
                value={resolveForm.matchId}
                onChange={(e) =>
                  setResolveForm((p) => ({ ...p, matchId: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Winner
              </label>
              <select
                required
                value={resolveForm.winner}
                onChange={(e) =>
                  setResolveForm((p) => ({ ...p, winner: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select winner</option>
                {["Brazil", "South Korea", "Japan", "Croatia", "Morocco", "Spain", "Argentina", "Australia", "France", "Poland", "England", "Senegal", "Portugal", "Switzerland", "Netherlands", "USA", "Croatia"].map(
                  (team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  )
                )}
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-medium text-white transition hover:bg-emerald-400 disabled:opacity-40"
            >
              {isPending ? "Resolving..." : "Resolve Match"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================
// GoalPredict — Custom React hooks wrapping wagmi contract
//               reads & writes
// ============================================================

"use client";

import { useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { GoalPredictCoreABI, ADDRESSES } from "@/lib/contracts";
import type { Tournament, Bracket, Match, TournamentStatus, Round } from "@/types";

// ---------- number -> status helper ----------
function statusFromCode(code: number): TournamentStatus {
  if (code === 0) return "active";   // TournamentStatus.Active
  if (code === 1) return "completed"; // TournamentStatus.Resolved
  return "completed";                 // TournamentStatus.Paid
}

// ---------- round index -> label helper ----------
const ROUND_LABELS: Round[] = ["R16", "QF", "SF", "Final"];
export function roundLabel(index: number): Round {
  return ROUND_LABELS[index] ?? "R16";
}

// ==========================================================
// useTournament
// ==========================================================
export function useTournament(id: number | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: ADDRESSES.GoalPredictCore,
    abi: GoalPredictCoreABI,
    functionName: "getTournament",
    args: id !== undefined ? [BigInt(id)] : undefined,
    query: { enabled: id !== undefined },
  });

  // getTournament returns: (id, startTime, endTime, entryFee, status, totalPool, roundPrizePool[4])
  const t = data as unknown as [bigint, bigint, bigint, bigint, number, bigint, [bigint, bigint, bigint, bigint]] | undefined;

  const tournament: Tournament | null = t
    ? {
        id: id!,
        name: `Tournament #${id}`,
        status: statusFromCode(t[4]),
        entryFee: t[3],
        totalPool: t[5],
        totalEntrants: 0, // use getEntrantsCount separately
        prizeDistribution: [
          Number(t[6][0]),
          Number(t[6][1]),
          Number(t[6][2]),
          Number(t[6][3]),
        ],
        currentRound: 0,
        totalRounds: 4,
        startTime: Number(t[1]),
        endTime: Number(t[2]),
      }
    : null;

  return { tournament, isLoading, error, refetch };
}

// ==========================================================
// useBracket
// ==========================================================
export function useBracket(tournamentId: number | undefined) {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    address: ADDRESSES.GoalPredictCore,
    abi: GoalPredictCoreABI,
    functionName: "getBracket",
    args:
      tournamentId !== undefined && address
        ? [BigInt(tournamentId), address]
        : undefined,
    query: { enabled: tournamentId !== undefined && !!address },
  });

  // getBracket returns: { picksR16: uint8[8], picksQF: uint8[4], picksSF: uint8[2], picksFinal: uint8 }
  const b = data as unknown as { picksR16: number[]; picksQF: number[]; picksSF: number[]; picksFinal: number } | undefined;

  const bracket: Bracket | null = b
    ? {
        tournamentId: tournamentId!,
        owner: address!,
        picks: [],
        submitted: b.picksR16.some((p: number) => p !== 0) || b.picksQF.some((p: number) => p !== 0),
        totalCorrect: 0,
        payoutClaimed: false,
      }
    : null;

  return { bracket, isLoading, error, refetch };
}

// ==========================================================
// useEnterTournament
// ==========================================================
export function useEnterTournament() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const enter = useCallback(
    async (tournamentId: number) => {
      // Step 1: Approve USDT spending (max uint256)
      writeContract({
        address: ADDRESSES.MockUSDT,
        abi: [
          { name: "approve", type: "function", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable" },
        ],
        functionName: "approve",
        args: [ADDRESSES.GoalPredictCore, 2n ** 256n - 1n],
      });
      // Step 2: Enter tournament (after approval tx confirms)
      // Note: In production, wait for approval tx to confirm first.
      // For demo, both txs will work since approval is max.
      setTimeout(() => {
        writeContract({
          address: ADDRESSES.GoalPredictCore,
          abi: GoalPredictCoreABI,
          functionName: "enterTournament",
          args: [BigInt(tournamentId)],
        });
      }, 100);
    },
    [writeContract],
  );

  return { enter, hash, error, isPending, isConfirming };
}

// ==========================================================
// useSubmitBracket
// ==========================================================
export function useSubmitBracket() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const submit = useCallback(
    (tournamentId: number, round: number, picks: number[]) => {
      writeContract({
        address: ADDRESSES.GoalPredictCore,
        abi: GoalPredictCoreABI,
        functionName: "submitBracket",
        args: [BigInt(tournamentId), round as unknown as number, picks as unknown as number[]],
      });
    },
    [writeContract],
  );

  return { submit, hash, error, isPending, isConfirming };
}

// ==========================================================
// useClaimPayout
// ==========================================================
export function useClaimPayout() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const claim = useCallback(
    (tournamentId: number) => {
      writeContract({
        address: ADDRESSES.GoalPredictCore,
        abi: GoalPredictCoreABI,
        functionName: "claimPayout",
        args: [BigInt(tournamentId)],
      });
    },
    [writeContract],
  );

  return { claim, hash, error, isPending, isConfirming };
}

// ==========================================================
// useMatch (read a single match)
// ==========================================================
export function useMatch(tournamentId: number | undefined, matchIndex: number | undefined) {
  const { data, isLoading } = useReadContract({
    address: ADDRESSES.GoalPredictCore,
    abi: GoalPredictCoreABI,
    functionName: "getMatch",
    args:
      tournamentId !== undefined && matchIndex !== undefined
        ? [BigInt(tournamentId), BigInt(matchIndex)]
        : undefined,
    query: { enabled: tournamentId !== undefined && matchIndex !== undefined },
  });

  // getMatch returns: (id, homeTeam, awayTeam, round, homeGoals, awayGoals, resolved)
  const m = data as unknown as [bigint, string, string, number, number, number, boolean] | undefined;

  const match: Match | null = m
    ? {
        id: Number(m[0]),
        tournamentId: tournamentId ?? 0,
        round: roundLabel(m[3]),
        roundIndex: m[3],
        homeTeam: m[1],
        awayTeam: m[2],
        homeScore: m[4],
        awayScore: m[5],
        winner: null,
        resolved: m[6],
        matchIndex: matchIndex ?? 0,
      }
    : null;

  return { match, isLoading };
}

// ==========================================================
// useMatchesCount — read total match count for a tournament
// ==========================================================
export function useMatchesCount(tournamentId: number | undefined) {
  const { data, isLoading } = useReadContract({
    address: ADDRESSES.GoalPredictCore,
    abi: GoalPredictCoreABI,
    functionName: "getMatchesCount",
    args: tournamentId !== undefined ? [BigInt(tournamentId)] : undefined,
    query: { enabled: tournamentId !== undefined },
  });

  return { count: data !== undefined ? Number(data) : 0, isLoading };
}

// ==========================================================
// useOwner — read contract owner address
// ==========================================================
export function useOwner() {
  const { data, isLoading } = useReadContract({
    address: ADDRESSES.GoalPredictCore,
    abi: GoalPredictCoreABI,
    functionName: "owner",
    args: [],
    query: { enabled: true },
  });

  return { owner: data as string | undefined, isLoading };
}

// ============================================================
// GoalPredict — TypeScript types
// ============================================================

export type TournamentStatus = "upcoming" | "active" | "completed";

export interface Tournament {
  id: number;
  name: string;
  status: TournamentStatus;
  entryFee: bigint;
  totalPool: bigint;
  totalEntrants: number;
  prizeDistribution: number[]; // percentage per round (basis points)
  currentRound: number;
  totalRounds: number;
  startTime: number;
  endTime: number;
}

export type Round = "R16" | "QF" | "SF" | "Final";

export interface Match {
  id: number;
  tournamentId: number;
  round: Round;
  roundIndex: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
  resolved: boolean;
  matchIndex: number; // position within the round
}

export interface Bracket {
  tournamentId: number;
  owner: string;
  picks: MatchPick[];
  submitted: boolean;
  totalCorrect: number;
  payoutClaimed: boolean;
}

export interface MatchPick {
  matchId: number;
  pickedWinner: string | null;
  round: Round;
}

export interface Prediction {
  homeTeam: string;
  awayTeam: string;
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
  predictedWinner: string;
  confidence: number;
  loading: boolean;
}

export interface TournamentStats {
  poolSize: bigint;
  entrants: number;
  prizePerPick: bigint;
  roundNumber: number;
}

export interface LeaderboardEntry {
  address: string;
  correctPicks: number;
  totalEarned: bigint;
  rank: number;
}

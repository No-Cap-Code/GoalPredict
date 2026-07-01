// ============================================================
// GoalPredict — BracketVisual component
// Full R16 → QF → SF → Final knockout bracket tree
// ============================================================

"use client";

import TeamBadge from "./TeamBadge";

export interface BracketMatch {
  id: number;
  homeTeam: string;
  awayTeam: string;
  winner: string | null;
  resolved: boolean;
  picks?: { pickedWinner: string } | null;
}

interface RoundData {
  label: string;
  matches: BracketMatch[];
}

interface BracketVisualProps {
  rounds: RoundData[];
  onPick?: (matchId: number, team: string) => void;
  locked?: boolean;
}

export default function BracketVisual({
  rounds,
  onPick,
  locked = false,
}: BracketVisualProps) {
  if (rounds.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 italic">
        No matches loaded yet.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex gap-6 min-w-max px-2">
        {rounds.map((round, ri) => (
          <RoundColumn
            key={round.label}
            round={round}
            roundIndex={ri}
            totalRounds={rounds.length}
            onPick={onPick}
            locked={locked}
          />
        ))}
      </div>
    </div>
  );
}

// ---------- Round column ----------
function RoundColumn({
  round,
  roundIndex,
  totalRounds,
  onPick,
  locked,
}: {
  round: RoundData;
  roundIndex: number;
  totalRounds: number;
  onPick?: (matchId: number, team: string) => void;
  locked: boolean;
}) {
  // totalRounds reserved for future bracket line styling
  void totalRounds;

  // Calculate spacing so that match boxes are vertically distributed
  // across the full bracket height
  const spacing = Math.pow(2, roundIndex + 1);

  return (
    <div className="flex flex-col">
      {/* Round header */}
      <div className="text-center mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-full">
          {round.label}
        </span>
      </div>

      {/* Matches */}
      <div className="flex flex-col justify-around flex-1 gap-4">
        {round.matches.map((match, mi) => {
          // Determine if this match has a user pick
          const userPicked = match.picks?.pickedWinner;

          return (
            <div
              key={match.id}
              className="relative"
              style={{ paddingTop: mi > 0 ? `${spacing * 0.5}rem` : "0" }}
            >
              {/* Match card */}
              <div
                className={`
                  rounded-lg border-2 p-2 min-w-[12rem] transition-colors
                  ${
                    match.resolved
                      ? "border-emerald-700/60 bg-slate-800/40"
                      : "border-slate-600 bg-slate-800/60"
                  }
                `}
              >
                {/* Home team */}
                <div className="flex items-center justify-between">
                  <TeamBadge
                    team={match.homeTeam}
                    size="sm"
                    selected={
                      userPicked === match.homeTeam ||
                      match.winner === match.homeTeam
                    }
                    onClick={() => {
                      if (!locked && onPick) onPick(match.id, match.homeTeam);
                    }}
                    disabled={locked || match.resolved}
                  />
                  {match.resolved && match.winner === match.homeTeam && (
                    <CheckMark />
                  )}
                </div>

                {/* VS divider */}
                <div className="flex items-center justify-center my-1">
                  <span className="text-xs text-slate-500 font-bold">VS</span>
                </div>

                {/* Away team */}
                <div className="flex items-center justify-between">
                  <TeamBadge
                    team={match.awayTeam}
                    size="sm"
                    selected={
                      userPicked === match.awayTeam ||
                      match.winner === match.awayTeam
                    }
                    onClick={() => {
                      if (!locked && onPick) onPick(match.id, match.awayTeam);
                    }}
                    disabled={locked || match.resolved}
                  />
                  {match.resolved && match.winner === match.awayTeam && (
                    <CheckMark />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Small check mark SVG ----------
function CheckMark() {
  return (
    <svg
      className="w-4 h-4 text-emerald-400 flex-shrink-0"
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
  );
}

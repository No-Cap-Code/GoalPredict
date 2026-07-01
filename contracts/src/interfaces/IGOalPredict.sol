// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface IGoalPredict {

    // ── Enums ────────────────────────────────────────────────────────────
    enum TournamentStatus { Active, Resolved, Paid }

    // ── Structs ──────────────────────────────────────────────────────────
    struct Tournament {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 entryFee;            // in USDT wei (18 decimals)
        TournamentStatus status;
        uint256 totalPool;
        uint256[4] roundPrizePool;   // R0=50%, R1=25%, R2=15%, R3=10%
    }

    struct Match {
        uint256 id;
        string  homeTeam;
        string  awayTeam;
        uint8   round;               // 0=R16, 1=QF, 2=SF, 3=Final
        uint8   homeGoals;
        uint8   awayGoals;
        bool    resolved;
    }

    struct Bracket {
        uint8[8] picksR16;   // Round of 16 – 8 matches
        uint8[4] picksQF;    // Quarter-finals – 4 matches
        uint8[2] picksSF;    // Semi-finals – 2 matches
        uint8    picksFinal; // Final – 1 match
    }

    // ── Events ───────────────────────────────────────────────────────────
    event BracketSubmitted(uint256 indexed tournamentId, address indexed user, uint8 round);
    event RoundResolved(uint256 indexed tournamentId, uint8 round);
    event PayoutClaimed(uint256 indexed tournamentId, address indexed user, uint256 amount);

    // ── Functions ────────────────────────────────────────────────────────
    function enterTournament(uint256 tournamentId) external;
    function submitBracket(uint256 tournamentId, uint8 round, uint8[] calldata picks) external;
    function resolveRound(uint256 tournamentId, uint8 round, uint8[] calldata winners) external;
    function claimPayout(uint256 tournamentId) external;
    function getBracket(uint256 tournamentId, address user) external view returns (Bracket memory);
    function getMatch(uint256 tournamentId, uint256 matchIndex) external view returns (Match memory);
    function getPoolSize(uint256 tournamentId) external view returns (uint256);
}

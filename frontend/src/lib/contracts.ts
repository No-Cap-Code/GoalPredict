// ============================================================
// GoalPredict — Contract ABIs (real) & addresses
// Generated from compiled Solidity contracts
// ============================================================

// ---------- Addresses (placeholder — replace after deploy) ----------

export const ADDRESSES = {
  GoalPredictCore: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" as const,
  BracketNFT: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as const,
  MockUSDT: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const,
} as const;

// ---------- GoalPredictCore ABI ----------
export const GoalPredictCoreABI = [
  {
    name: "enterTournament",
    type: "function",
    inputs: [{ name: "tournamentId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "submitBracket",
    type: "function",
    inputs: [
      { name: "tournamentId", type: "uint256" },
      { name: "round", type: "uint8" },
      { name: "picks", type: "uint8[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "resolveRound",
    type: "function",
    inputs: [
      { name: "tournamentId", type: "uint256" },
      { name: "round", type: "uint8" },
      { name: "winners", type: "uint8[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "claimPayout",
    type: "function",
    inputs: [{ name: "tournamentId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "createTournament",
    type: "function",
    inputs: [
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "entryFee", type: "uint256" },
    ],
    outputs: [{ name: "tournamentId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    name: "addMatch",
    type: "function",
    inputs: [
      { name: "tournamentId", type: "uint256" },
      { name: "homeTeam", type: "string" },
      { name: "awayTeam", type: "string" },
      { name: "round", type: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "getTournament",
    type: "function",
    inputs: [{ name: "tournamentId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "startTime", type: "uint256" },
          { name: "endTime", type: "uint256" },
          { name: "entryFee", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "totalPool", type: "uint256" },
          {
            name: "roundPrizePool",
            type: "uint256[4]",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    name: "getMatch",
    type: "function",
    inputs: [
      { name: "tournamentId", type: "uint256" },
      { name: "matchIndex", type: "uint256" },
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "homeTeam", type: "string" },
          { name: "awayTeam", type: "string" },
          { name: "round", type: "uint8" },
          { name: "homeGoals", type: "uint8" },
          { name: "awayGoals", type: "uint8" },
          { name: "resolved", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    name: "getBracket",
    type: "function",
    inputs: [
      { name: "tournamentId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "picksR16", type: "uint8[8]" },
          { name: "picksQF", type: "uint8[4]" },
          { name: "picksSF", type: "uint8[2]" },
          { name: "picksFinal", type: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    name: "getPoolSize",
    type: "function",
    inputs: [{ name: "tournamentId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "getEntrantsCount",
    type: "function",
    inputs: [{ name: "tournamentId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "getMatchesCount",
    type: "function",
    inputs: [{ name: "tournamentId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "owner",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
] as const;

// ---------- BracketNFT ABI ----------
export const BracketNFTABI = [
  {
    name: "ownerOf",
    type: "function",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
] as const;

// ---------- MockUSDT ABI ----------
export const MockUSDTABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

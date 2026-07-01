# GoalPredict ⚽🏆

**Football knockout bracket predictor with USDT staking.**

## Project Overview
GoalPredict is a dApp for the Tether Developers Cup hackathon.
Fans stake USDT to predict knockout match outcomes in a football tournament.
Winners split the prize pool proportionally each round.

## Tech Stack
- **Smart Contracts**: Solidity 0.8.25, Foundry (forge/foclor)
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Web3**: wagmi v2, viem, ConnectKit
- **Network**: Base Sepolia (testnet) for demo
- **Token**: USDT (ERC-20)

## Architecture
```
contracts/
  src/
    GoalPredictCore.sol    — Main tournament contract
    BracketNFT.sol         — ERC-721 bracket tickets
    MockUSDT.sol           — Testnet USDT mock
    interfaces/
      IGoalPredict.sol     — Core interface
  test/                    — Foundry tests
  script/                  — Deploy scripts

frontend/
  src/
    app/                   — Next.js pages
    components/            — React components
    lib/                   — Config, ABIs, helpers
    hooks/                 — Custom React hooks
    types/                 — TypeScript types
```

## Key Decisions
- **Oracle**: Admin multi-sig for hackathon demo (Chainlink Functions in prod)
- **Payout**: Fixed per correct pick per round (clear UX)
- **Chain**: Base Sepolia (cheap, Coinbase Wallet native)
- **NFT**: Tradeable ERC-721 bracket tickets
- **Prize Pool**: 50% R1 → 25% R2 → 15% R3 → 10% Final

## Running
```bash
# Contracts
cd contracts && forge test
cd contracts && forge script script/Deploy.s.sol

# Frontend
cd frontend && npm install
cd frontend && npm run dev
```

## Third-Party Services
- wagmi/viem — Web3 connection
- ConnectKit — Wallet connection UI
- Base Sepolia — Testnet
- OpenZeppelin — ERC-20, ERC-721, Ownable

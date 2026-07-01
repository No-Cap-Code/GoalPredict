# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## GoalPredict ⚽🏆

Football knockout bracket predictor with USDT staking. Built for the **Tether Developers Cup** hackathon.

**Tracks:** WDK (Wallets) + QVAC (Local AI)

## Commands

```bash
# Contracts — Foundry
cd contracts && forge build          # Compile contracts
cd contracts && forge test           # Run all tests
cd contracts && forge test --match-test testName  # Single test

# Frontend — Next.js 14
cd frontend && npm install           # Install deps
cd frontend && npm run dev           # Dev server (localhost:3000)
cd frontend && npm run build         # Production build
cd frontend && npm run lint          # ESLint check
```

## Architecture

**Monorepo** with two independent packages:
- `contracts/` — Foundry (Solidity 0.8.25)
- `frontend/` — Next.js 14 App Router (TypeScript + Tailwind)

### Smart Contracts
- `GoalPredictCore.sol` — Tournament pool: USDT deposits, bracket submissions, round resolution, prize payouts. Uses OpenZeppelin Ownable + ReentrancyGuard. Prize split: 50% R1 → 25% R2 → 15% R3 → 10% Final.
- `BracketNFT.sol` — ERC-721 tickets representing a fan's bracket picks. Metadata stores picks per round.
- `MockUSDT.sol` — Testnet ERC-20 USDT mock with public mint.
- Oracle is admin multi-sig for hackathon demo (Chainlink Functions in prod).

### Frontend Stack
- wagmi v2 + viem + ConnectKit for wallet connection
- `@tetherto/wdk` — Wallet Development Kit for self-custodial USDT wallet
- `@qvac/sdk` — Local AI for on-device match predictions (no cloud APIs)
- Base Sepolia testnet (chain ID 84532)

### Key Data Flow
Fan → WDK wallet connect → USDT deposit to pool → bracket picks (QVAC AI-assisted) → picks locked on-chain → admin resolves round → winners claim USDT

## Key Decisions
- **Oracle:** Admin multi-sig for hackathon (documented: Chainlink in prod)
- **Payout:** Fixed per correct pick per round
- **Chain:** Base Sepolia (cheap, Coinbase Wallet native)
- **NFT:** Tradeable ERC-721 bracket tickets

## Third-Party Services
- `@tetherto/wdk` + `@tetherto/wdk-wallet-evm` — wallet
- `@qvac/sdk` — local AI inference
- OpenZeppelin — ERC-20, ERC-721, Ownable, ReentrancyGuard

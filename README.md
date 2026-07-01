# GoalPredict ⚽🏆

Football knockout bracket predictor with USDT staking.

Built for the **Tether Developers Cup** hackathon.

## Tracks
- **WDK (Wallets)** — Self-custodial USDT wallet, deposits, payouts
- **QVAC (Local AI)** — On-device match prediction AI, no cloud, no API keys

## Tech Stack
- **Smart Contracts**: Solidity 0.8.25, Foundry
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Wallet**: WDK (`@tetherto/wdk`, `@tetherto/wdk-wallet-evm`)
- **AI**: QVAC SDK (`@qvac/sdk`) — runs locally on user's device
- **Web3**: wagmi v2, viem, ConnectKit
- **Network**: Base Sepolia (testnet)

## How It Works
1. Fan connects self-custodial wallet via WDK
2. Deposits USDT into tournament pool contract
3. Picks knockout bracket winners (AI-assisted via QVAC)
4. Picks locked on-chain, prize pool grows
5. After each round, winners claim proportional USDT payouts
6. Perfect bracket = jackpot bonus

## Prize Pool Split
- Round 1 (R16): 50%
- Round 2 (QF): 25%
- Round 3 (SF): 15%
- Final: 10%

## Running
```bash
# Contracts
cd contracts && forge test

# Frontend
cd frontend && npm install && npm run dev
```

## Third-Party Services
- `@tetherto/wdk` — Wallet Development Kit
- `@qvac/sdk` — Local AI inference
- wagmi/viem — Web3 connection
- ConnectKit — Wallet connection UI
- OpenZeppelin — ERC-20, ERC-721, Ownable
- Base Sepolia — Testnet

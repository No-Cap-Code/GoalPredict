// ============================================================
// GoalPredict — wagmi / ConnectKit configuration
// ============================================================

import { http, createConfig } from "wagmi";
import { baseSepolia, foundry } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

// Use Anvil (local) by default for demo, Base Sepolia for production
const isClient = typeof window !== "undefined";
const isLocal = isClient && process.env.NEXT_PUBLIC_LOCAL === "true";
const chain = isLocal ? foundry : baseSepolia;
const RPC_URL = isLocal
  ? "http://127.0.0.1:8545"
  : "https://sepolia.base.org";

export const config = createConfig(
  getDefaultConfig({
    appName: "GoalPredict",
    walletConnectProjectId: "00000000000000000000000000000000",
    chains: [chain],
    transports: {
      [chain.id]: http(RPC_URL),
    },
  }),
);

export { chain as activeChain };

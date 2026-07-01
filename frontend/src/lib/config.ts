// ============================================================
// GoalPredict — wagmi / ConnectKit configuration
// ============================================================

import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 84532);
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://sepolia.base.org";

// Keep wagmi's built-in baseSepolia — only override the RPC transport
// so the dApp can hit a custom endpoint.
const baseSepoliaOverride = {
  ...baseSepolia,
  id: CHAIN_ID,
} as const;

export const config = createConfig(
  getDefaultConfig({
    appName: "GoalPredict",
    walletConnectProjectId: "00000000000000000000000000000000", // placeholder
    chains: [baseSepoliaOverride],
    transports: {
      [CHAIN_ID]: http(RPC_URL),
    },
  }),
);

export { baseSepoliaOverride as baseSepoliaChain };

// ============================================================
// GoalPredict — Landing / Home page
// Hero, stats, how-it-works, CTA
// ============================================================

"use client";

import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { GoalPredictCoreABI, ADDRESSES } from "@/lib/contracts";

const STEPS = [
  {
    icon: "🔗",
    title: "Connect Wallet",
    description: "Link your wallet to Base Sepolia via ConnectKit.",
  },
  {
    icon: "💰",
    title: "Stake USDT",
    description: "Deposit USDT to enter the tournament bracket.",
  },
  {
    icon: "🎯",
    title: "Pick Winners",
    description: "Use QVAC AI predictions or your own intuition to pick match winners.",
  },
  {
    icon: "🏆",
    title: "Win the Pool",
    description: "Correct picks earn a share of the USDT prize pool each round.",
  },
];

export default function Home() {
  const { isConnected } = useAccount();

  // Read live tournament data (id = 0)
  const { data } = useReadContract({
    address: ADDRESSES.GoalPredictCore,
    abi: GoalPredictCoreABI,
    functionName: "getTournament",
    args: [0n],
    query: { enabled: true, refetchInterval: 15_000 },
  });

  const t = data as unknown as [bigint, bigint, bigint, bigint, number, bigint, bigint[]] | undefined;
  const poolSize = t ? Number(t[5]) / 1e18 : 0;
  const entrants = 0; // TODO: wire up getEntrantsCount
  const prizePerPick = t ? Number(t[6][0]) / 1e18 : 0; // first round pool

  return (
    <div className="bg-pitch relative overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-24 text-center">
        {/* Pitch lines decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-white" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-white opacity-50" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-6 text-7xl">⚽🏆</div>

          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
            GoalPredict
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-lg text-emerald-100/80">
            Predict knockout football matches. Stake USDT. Win the prize pool.
            Powered by QVAC AI predictions on Base Sepolia.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {!isConnected ? (
              <span className="rounded-xl bg-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400">
                Connect Wallet to Play
              </span>
            ) : (
              <Link
                href="/play"
                className="rounded-xl bg-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400 hover:shadow-emerald-900/60"
              >
                Enter Tournament
              </Link>
            )}

            <a
              href="https://docs.tether.io"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border-2 border-white/20 bg-white/10 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/20"
            >
              Tether Developers Cup
            </a>
          </div>
        </div>
      </section>

      {/* Pool Stats */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Live Pool Size"
            value={`$${poolSize.toLocaleString()}`}
            sub="USDT staked"
          />
          <StatCard
            label="Number of Entrants"
            value={entrants.toLocaleString()}
            sub="predictions submitted"
          />
          <StatCard
            label="Prize Per Correct Pick"
            value={`$${prizePerPick.toFixed(2)}`}
            sub="USDT per pick per round"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-20">
        <h2 className="mb-10 text-center text-3xl font-bold text-white">
          How It Works
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-emerald-800/50 bg-white/5 p-6 text-center backdrop-blur-sm"
            >
              <div className="mb-3 text-4xl">{step.icon}</div>
              <div className="mb-1 text-xs font-bold uppercase tracking-widest text-emerald-400">
                Step {i + 1}
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">{step.title}</h3>
              <p className="text-sm text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-20 text-center">
        <div className="rounded-2xl border border-emerald-800/50 bg-emerald-900/30 p-10 backdrop-blur-sm">
          <h2 className="mb-3 text-2xl font-bold text-white">
            Ready to predict the next champion?
          </h2>
          <p className="mb-6 text-slate-400">
            Join the Tether Developers Cup. Use AI-powered predictions to fill
            out your bracket and compete for the USDT prize pool.
          </p>
          <Link
            href="/play"
            className="inline-block rounded-xl bg-amber-500 px-8 py-4 text-lg font-bold text-slate-900 shadow-lg transition hover:bg-amber-400"
          >
            Start Predicting
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-800/40 bg-black/20 p-6 text-center backdrop-blur-sm">
      <div className="mb-1 text-xs font-bold uppercase tracking-widest text-emerald-400">
        {label}
      </div>
      <div className="mb-1 text-3xl font-extrabold text-white">{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  );
}

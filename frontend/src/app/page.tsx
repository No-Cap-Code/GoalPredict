// ============================================================
// GoalPredict — Landing / Home page
// Hero, stats, how-it-works, FAQ, CTA
// ============================================================

"use client";

import { useState, useCallback } from "react";
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

const FAQ_ITEMS = [
  {
    question: "What is GoalPredict?",
    answer:
      "GoalPredict is a football knockout bracket predictor built on Base Sepolia. Fans stake USDT to enter a tournament, pick winners in each match, and earn a share of the prize pool based on how many picks they get right.",
  },
  {
    question: "How do I enter?",
    answer:
      "Connect your self-custodial wallet using ConnectKit, then deposit the USDT entry fee. You will receive an ERC-721 bracket NFT that represents your tournament ticket and stores your picks on-chain.",
  },
  {
    question: "How do prizes work?",
    answer:
      "The prize pool is split across rounds: 50% for Round of 16, 25% for Quarter-Finals, 15% for Semi-Finals, and 10% for the Final. Within each round, the pool is divided equally among all entrants who picked correctly.",
  },
  {
    question: "What is QVAC AI?",
    answer:
      "QVAC is an on-device AI engine that runs match predictions directly in your browser. No cloud APIs are used — your data stays private and predictions are generated locally using the QVAC SDK.",
  },
  {
    question: "Is my USDT safe?",
    answer:
      "Yes. GoalPredict uses Tether's Wallet Development Kit (WDK) for a fully self-custodial experience. Your private keys never leave your device. Funds are deposited directly into the smart contract via your own wallet.",
  },
  {
    question: "Can I trade my bracket?",
    answer:
      "Absolutely. Every bracket submission mints an ERC-721 NFT that represents your picks. Like any NFT, it can be transferred or traded on compatible marketplaces.",
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
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        {/* Pitch lines decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-white" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-white opacity-50" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-6 text-5xl sm:text-6xl md:text-7xl">⚽🏆</div>

          <h1 className="mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            GoalPredict
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base sm:text-lg text-emerald-100/80">
            Predict knockout football matches. Stake USDT. Win the prize pool.
            Powered by QVAC AI predictions on Base Sepolia.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
            {!isConnected ? (
              <span className="w-full sm:w-auto rounded-xl bg-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400 text-center">
                Connect Wallet to Play
              </span>
            ) : (
              <Link
                href="/play"
                className="w-full sm:w-auto rounded-xl bg-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400 hover:shadow-emerald-900/60 text-center"
              >
                Enter Tournament
              </Link>
            )}

            <a
              href="https://docs.tether.io"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto rounded-xl border-2 border-white/20 bg-white/10 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/20 text-center"
            >
              Tether Developers Cup
            </a>
          </div>
        </div>
      </section>

      {/* Pool Stats */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard
            label="Live Pool Size"
            value={`$${poolSize.toLocaleString()}`}
            sub="USDT staked"
            tooltip="Total USDT deposited by all entrants in this tournament."
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
      <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="mb-10 text-center text-2xl sm:text-3xl font-bold text-white">
          How It Works
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* FAQ / Help Section */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="mb-10 text-center text-2xl sm:text-3xl font-bold text-white">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <FAQAccordion
              key={item.question}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <div className="rounded-2xl border border-emerald-800/50 bg-emerald-900/30 p-6 sm:p-10 backdrop-blur-sm">
          <h2 className="mb-3 text-xl sm:text-2xl font-bold text-white">
            Ready to predict the next champion?
          </h2>
          <p className="mb-6 text-slate-400 text-sm sm:text-base">
            Join the Tether Developers Cup. Use AI-powered predictions to fill
            out your bracket and compete for the USDT prize pool.
          </p>
          <Link
            href="/play"
            className="inline-block w-full sm:w-auto rounded-xl bg-amber-500 px-8 py-4 text-lg font-bold text-slate-900 shadow-lg transition hover:bg-amber-400"
          >
            Start Predicting
          </Link>
        </div>
      </section>
    </div>
  );
}

// ---------- StatCard with optional tooltip ----------
function StatCard({
  label,
  value,
  sub,
  tooltip,
}: {
  label: string;
  value: string;
  sub: string;
  tooltip?: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-800/40 bg-black/20 p-4 sm:p-6 text-center backdrop-blur-sm">
      <div className="mb-1 flex items-center justify-center gap-1.5">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-400">
          {label}
        </span>
        {tooltip && (
          <span className="group relative">
            <span className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-emerald-800/60 text-[10px] font-bold text-emerald-300">
              ?
            </span>
            <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs text-slate-300 opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
              {tooltip}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
            </span>
          </span>
        )}
      </div>
      <div className="mb-1 text-2xl sm:text-3xl font-extrabold text-white">{value}</div>
      <div className="text-[10px] sm:text-xs text-slate-500">{sub}</div>
    </div>
  );
}

// ---------- FAQ Accordion ----------
function FAQAccordion({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <div className="rounded-xl border border-emerald-800/40 bg-black/20 backdrop-blur-sm">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left"
      >
        <span className="text-sm font-semibold text-white">{question}</span>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-emerald-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
          <p className="text-sm leading-relaxed text-slate-400">{answer}</p>
        </div>
      )}
    </div>
  );
}

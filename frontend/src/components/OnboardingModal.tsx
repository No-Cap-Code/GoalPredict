// ============================================================
// GoalPredict — OnboardingModal component
// First-visit tutorial with 4 steps stored in localStorage
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "goalpredict_onboarding_complete";

const STEPS = [
  {
    icon: "\u{1F3D8}️",
    title: "Connect Your Wallet",
    description:
      "Link your self-custodial wallet using Tether's Wallet Development Kit (WDK). Your keys, your crypto — no custodian holds your funds. Supports Base Sepolia for cheap, fast transactions.",
  },
  {
    icon: "⚽",
    title: "Enter the Tournament",
    description:
      "Deposit USDT as your entry fee and receive a unique bracket NFT. This ERC-721 token represents your ticket into the tournament and stores all of your picks on-chain.",
  },
  {
    icon: "\u{1F9E0}",
    title: "Make Your Picks",
    description:
      "Select winners in each knockout match to build your bracket. QVAC AI runs right on your device to suggest match predictions — no cloud APIs, fully private.",
  },
  {
    icon: "\u{1F3C6}",
    title: "Claim Winnings",
    description:
      "After each round is resolved, correct pickers claim proportional USDT payouts. Prize split: 50% R16, 25% QF, 15% SF, 10% Final. Your winnings go straight to your wallet.",
  },
];

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
    setCurrentStep(0);
  }, []);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleComplete}
      />

      {/* Modal card */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        {/* Step icon */}
        <div className="mb-4 text-center text-6xl">{step.icon}</div>

        {/* Step counter */}
        <div className="mb-2 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>

        {/* Title */}
        <h2 className="mb-3 text-center text-2xl font-bold text-white">
          {step.title}
        </h2>

        {/* Description */}
        <p className="mb-8 text-center text-sm leading-relaxed text-slate-400">
          {step.description}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          {!isLastStep ? (
            <button
              onClick={handleNext}
              className="rounded-xl bg-amber-500 px-8 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-amber-400"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="rounded-xl bg-amber-500 px-8 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-amber-400"
            >
              Got it!
            </button>
          )}
        </div>

        {/* Skip link */}
        {!isLastStep && (
          <div className="mt-4 text-center">
            <button
              onClick={handleComplete}
              className="text-xs text-slate-500 transition hover:text-slate-300"
            >
              Skip tutorial
            </button>
          </div>
        )}

        {/* Progress dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${
                i === currentStep
                  ? "bg-amber-400 w-6"
                  : i < currentStep
                  ? "bg-amber-600"
                  : "bg-slate-600"
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

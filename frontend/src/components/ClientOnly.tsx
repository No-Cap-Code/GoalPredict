"use client";

import { type ReactNode, useState, useEffect } from "react";

export default function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⚽</div>
          <p className="text-slate-400 text-sm">Loading GoalPredict...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

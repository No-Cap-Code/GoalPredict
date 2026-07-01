// ============================================================
// GoalPredict — NavBar component (client component)
// Shows nav links and ConnectKit wallet button
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/play", label: "Play" },
  { href: "/results", label: "Results" },
  { href: "/admin", label: "Admin" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-white hover:opacity-90"
        >
          <span className="text-2xl">⚽</span>
          <span>GoalPredict</span>
          <span className="text-amber-400 text-2xl">🏆</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-emerald-400 underline underline-offset-4 decoration-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Wallet connect */}
        <ConnectKitButton />
      </div>
    </header>
  );
}

// ============================================================
// GoalPredict — NavBar component (client component)
// Shows nav links and ConnectKit wallet button
// ============================================================

"use client";

import { useState, useEffect } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const closeMenu = () => setIsMenuOpen(false);

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

        {/* Mobile hamburger button */}
        <button
          className="sm:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Nav links - desktop */}
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

        {/* Wallet connect - desktop */}
        <div className="hidden sm:block">
          {mounted && <ConnectKitButton />}
        </div>

        {/* Mobile dropdown menu */}
        {isMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 py-4 px-4 animate-slide-down">
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`text-base font-medium px-3 py-2 rounded-lg transition-colors ${
                    pathname === link.href
                      ? "bg-emerald-900/30 text-emerald-400"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-slate-800">
                {mounted && <ConnectKitButton />}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

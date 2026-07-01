// ============================================================
// GoalPredict — Root layout (server component)
// Wraps app in client-side Providers + NavBar
// ============================================================

import type { Metadata } from "next";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoalPredict - Football Bracket Predictions",
  description:
    "Stake USDT to predict knockout football matches and win the prize pool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <Providers>
          <NavBar />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

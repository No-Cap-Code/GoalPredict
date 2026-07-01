// ============================================================
// GoalPredict — Root layout (server component)
// Wraps app in client-side Providers + NavBar + OnboardingModal
// ============================================================

import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";
import OnboardingModal from "@/components/OnboardingModal";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoalPredict - Football Bracket Predictions",
  description:
    "Stake USDT to predict knockout football matches and win the prize pool.",
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <Providers>
          <NavBar />
          <main className="min-h-screen">{children}</main>
          <OnboardingModal />
        </Providers>
      </body>
    </html>
  );
}

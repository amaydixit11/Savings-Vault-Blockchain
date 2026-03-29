"use client";

import { useState, useEffect, useCallback } from "react";
import { Meteors } from "@/components/ui/meteors";
import Navbar from "@/components/Navbar";
import ContractUI from "@/components/Contract";
import {
  connectWallet,
  getWalletAddress,
  checkConnection,
} from "@/hooks/contract";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (await checkConnection()) {
          const addr = await getWalletAddress();
          if (addr) setWalletAddress(addr);
        }
      } catch {
        /* Freighter not installed */
      }
    })();
  }, []);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      setWalletAddress(await connectWallet());
    } catch {
      // handled in Contract component
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    setWalletAddress(null);
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-[#fdfdfd] overflow-hidden text-[#1c1c24]">
      {/* Meteors */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Meteors number={12} className="opacity-20" />
      </div>

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#fbbf24]/5 blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#10b981]/5 blur-[120px] animate-float-delayed" />
      </div>

      {/* Navbar */}
      <Navbar
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        isConnecting={isConnecting}
      />

      {/* Hero + Content */}
      <main className="relative z-10 flex flex-1 w-full max-w-5xl mx-auto flex-col items-center px-6 pt-10 pb-16">
        {/* Hero — compact */}
        <div className="mb-10 text-center animate-fade-in-up">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/[0.05] bg-black/[0.02] px-4 py-1.5 text-sm text-black/40 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10b981]" />
            </span>
            Powered by Soroban on Stellar
          </div>

          <h1 className="mb-3">
            <span className="block text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              <span className="text-black">Secure Your </span>
              <span className="bg-gradient-to-r from-[#d4af37] via-[#10b981] to-[#d4af37] bg-[length:200%_auto] animate-gradient-shift bg-clip-text text-transparent">
                Savings Legend
              </span>
            </span>
          </h1>

          <p className="mx-auto max-w-lg text-sm sm:text-base leading-relaxed text-black/50 font-medium">
            Join the vault of elite savers. Transparent, decentralized, and entirely self-custodial on the Stellar network.
          </p>

          {/* Inline stats */}
          <div className="mt-6 flex items-center justify-center gap-6 sm:gap-10 animate-fade-in-up-delayed">
            {[
              { label: "Stability", value: "99.9%" },
              { label: "Stellar", value: "Testnet" },
              { label: "Security", value: "Vetted" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg sm:text-xl font-bold text-black/80 font-mono tracking-tighter">{stat.value}</p>
                <p className="text-[10px] text-black/30 uppercase tracking-widest mt-0.5 font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contract UI */}
        <ContractUI
          walletAddress={walletAddress}
          onConnect={handleConnect}
          isConnecting={isConnecting}
        />

        {/* Footer info */}
        <div className="mt-10 flex flex-col items-center gap-4 animate-fade-in opacity-60">
           <div className="flex items-center gap-8 text-[10px] text-black/20">
            <div className="flex items-center gap-2">
               <div className="h-1 w-1 rounded-full bg-[#fbbf24]" />
               <span className="font-bold">Vaulted Asset</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="h-1 w-1 rounded-full bg-[#34d399]" />
               <span className="font-bold">Liquidity Verified</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-50">
               <span className="font-mono text-[9px] font-bold">SAV-v1.0</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-black/10 opacity-50 hover:opacity-100 transition-opacity">
            <span>Built by Amay Dixit &middot; BIB Bootcamp 2026</span>
          </div>
        </div>
      </main>
    </div>
  );
}



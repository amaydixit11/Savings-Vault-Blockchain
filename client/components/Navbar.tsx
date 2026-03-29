"use client";

import { useState, useEffect, useCallback } from "react";
import { NETWORK } from "@/hooks/contract";
import { Badge } from "@/components/ui/badge";

function WalletIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckSmallIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}

function SafeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="2" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 8v1" />
      <path d="M12 15v1" />
      <path d="M8 12h1" />
      <path d="M15 12h1" />
    </svg>
  );
}

interface NavbarProps {
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting: boolean;
}

export default function Navbar({
  walletAddress,
  onConnect,
  onDisconnect,
  isConnecting,
}: NavbarProps) {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const close = () => setShowDropdown(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showDropdown]);

  const handleCopy = useCallback(async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  const truncate = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 animate-fade-in-down ${
        scrolled
          ? "border-black/[0.08] bg-white/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
          : "border-black/[0.04] bg-transparent backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#d4af37] to-[#10b981] shadow-[0_4px_20px_rgba(212,175,55,0.2)] group-hover:scale-105 transition-all">
            <SafeIcon />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-black/80 group-hover:text-[#10b981] transition-colors">
              SavingsVault
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-black/20 border border-black/[0.06] rounded px-1.5 py-0.5 font-bold">
              Protocol
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Badge variant="success" className="bg-[#10b981]/10 text-[#059669] border-[#10b981]/20 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
            {NETWORK}
          </Badge>

          {walletAddress ? (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
                className="flex items-center gap-2.5 rounded-xl border border-black/[0.08] bg-black/[0.02] px-3 py-2 text-sm transition-all hover:bg-black/[0.04]"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#d4af37] to-[#10b981] p-[1.5px]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[8px] font-bold text-black/60">
                    {walletAddress.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <span className="font-mono text-xs text-black/50 font-bold">
                  {truncate(walletAddress)}
                </span>
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`text-black/20 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-black/[0.08] bg-white/95 backdrop-blur-2xl shadow-2xl animate-fade-in-up"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 border-b border-black/[0.06]">
                    <p className="text-[10px] uppercase tracking-wider text-black/25 mb-2 font-bold">
                      Connected Wallet
                    </p>
                    <p className="font-mono text-xs text-black/60 break-all leading-relaxed font-bold italic">
                      {walletAddress}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { handleCopy(); setShowDropdown(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-black/40 hover:bg-black/[0.03] hover:text-black/80 transition-colors font-bold"
                    >
                      {copied ? <CheckSmallIcon /> : <CopyIcon />}
                      {copied ? "Copied!" : "Copy Address"}
                    </button>
                    <button
                      onClick={() => { onDisconnect(); setShowDropdown(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#dc2626]/70 hover:bg-[#dc2626]/[0.05] hover:text-[#dc2626] transition-colors font-bold"
                    >
                      <PowerIcon />
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#d4af37] to-[#10b981] p-[1px] transition-all hover:shadow-[0_4px_25px_rgba(212,175,55,0.15)] active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center gap-2 rounded-[11px] bg-white/95 px-4 py-2 text-sm font-bold text-black/70 backdrop-blur-sm">
                {isConnecting ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <WalletIcon size={14} />
                    Connect
                  </>
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}


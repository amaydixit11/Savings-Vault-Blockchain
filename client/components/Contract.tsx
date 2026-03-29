"use client";

import { useState, useCallback, useEffect } from "react";
import {
  deposit,
  withdraw,
  getBalance,
  viewVaultStats,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14m7-7-7 7-7-7" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5m-7 7 7-7 7 7" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0a0a0a]/30">
        {label}
      </label>
      <div className="group rounded-xl border border-black/[0.1] bg-black/[0.02] p-px transition-all focus-within:border-[#d4af37]/50 focus-within:shadow-[0_4px_20px_rgba(212,175,55,0.1)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-[#0a0a0a] placeholder:text-[#0a0a0a]/20 outline-none font-bold"
        />
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "overview" | "deposit" | "withdraw";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [userBalance, setUserBalance] = useState<bigint | null>(null);
  const [vaultStats, setVaultStats] = useState<{ total_amount: bigint, user_count: bigint } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatAmount = (val: bigint | null) => {
    if (val === null) return "0";
    const num = Number(val);
    if (num > 1000000) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(num);
    }
    return new Intl.NumberFormat("en-US").format(num);
  };

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const stats: any = await viewVaultStats();
      if (stats) {
        setVaultStats({
          total_amount: BigInt(stats.total_amount || 0),
          user_count: BigInt(stats.user_count || 0)
        });
      }
      if (walletAddress) {
        const bal: any = await getBalance(walletAddress);
        setUserBalance(BigInt(bal || 0));
      }
    } catch (err) {
      console.error("Stats error", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleDeposit = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!depositAmount || Number(depositAmount) <= 0) return setError("Enter valid amount");
    setError(null);
    setIsDepositing(true);
    setTxStatus("Securing assets in the legend's vault...");
    try {
      await deposit(walletAddress, BigInt(depositAmount));
      setTxStatus("Success! Your wealth is now legendary.");
      setDepositAmount("");
      fetchStats();
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Deposit failed");
      setTxStatus(null);
    } finally {
      setIsDepositing(false);
    }
  }, [walletAddress, depositAmount, fetchStats]);

  const handleWithdraw = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return setError("Enter valid amount");
    setError(null);
    setIsWithdrawing(true);
    setTxStatus("Unlocking wealth from the vault...");
    try {
      await withdraw(walletAddress, BigInt(withdrawAmount));
      setTxStatus("Withdrawal complete. Legend persists!");
      setWithdrawAmount("");
      fetchStats();
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
      setTxStatus(null);
    } finally {
      setIsWithdrawing(false);
    }
  }, [walletAddress, withdrawAmount, fetchStats]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "overview", label: "Dashboard", icon: <TrendingUpIcon />, color: "#10b981" },
    { key: "deposit", label: "Save", icon: <ArrowDownIcon />, color: "#d4af37" },
    { key: "withdraw", label: "Withdraw", icon: <ArrowUpIcon />, color: "#dc2626" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toast Handling */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#dc2626]/10 bg-[#dc2626]/[0.03] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#dc2626] font-bold"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#dc2626]/80 tracking-tight">Security Alert</p>
            <p className="text-xs text-[#dc2626]/50 mt-0.5 font-bold italic">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#dc2626]/30 hover:text-[#dc2626]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#10b981]/10 bg-[#10b981]/[0.03] px-4 py-3 backdrop-blur-sm shadow-[0_4px_20px_rgba(16,185,129,0.05)] animate-slide-down">
          <span className="text-[#10b981]">
            {txStatus.includes("complete") || txStatus.includes("Success") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#059669] font-bold">{txStatus}</span>
        </div>
      )}

      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.04)]" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/[0.04] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#d4af37]/10 to-[#10b981]/10 border border-black/[0.04]">
                <MoneyIcon />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#0a0a0a]">Savings Vault</h3>
                <p className="text-[10px] text-[#0a0a0a]/60 font-black font-mono mt-0.5 tracking-tight">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="bg-[#10b981]/10 text-[#059669] border-[#10b981]/10 uppercase tracking-tighter text-[9px] font-bold">Protocol Active</Badge>
            </div>
          </div>

          {/* Wallet Info Banner */}
          {walletAddress ? (
            <div className="bg-gradient-to-r from-black/[0.01] to-transparent px-6 py-2 border-b border-black/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WalletIcon />
                <span className="text-[10px] font-mono text-[#0a0a0a]/60 font-black">{truncate(walletAddress)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#0a0a0a]/40 font-black">Liquidity:</span>
                <span className="text-xs font-black text-[#059669]">{formatAmount(userBalance)} XLM</span>
              </div>
            </div>
          ) : (
            <div className="bg-black/[0.02] px-6 py-2 border-b border-black/[0.02] flex items-center justify-center">
              <p className="text-[10px] text-[#0a0a0a]/40 font-black">Authenticate with Freighter for personal vault access</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-black/[0.08] px-2 bg-[#fdfdfd]">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-black transition-all group",
                  activeTab === t.key ? "text-[#0a0a0a]" : "text-[#0a0a0a]/40 hover:text-[#0a0a0a]/60"
                )}
              >
                <span className="transition-transform group-hover:scale-110" style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}33)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-black/[0.04] bg-white p-5 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute -right-4 -top-4 text-[#0a0a0a]/[0.02] group-hover:text-[#0a0a0a]/[0.05] transition-colors scale-150">
                      <MoneyIcon />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0a0a0a]/40">Protocol TVL</p>
                    <h4 className="mt-2 text-xl sm:text-2xl font-black text-[#059669] font-mono tracking-tighter break-all leading-none">
                      {formatAmount(vaultStats?.total_amount || 0n)}
                      <span className="text-[10px] ml-1 text-[#0a0a0a]/40 font-black uppercase">XLM</span>
                    </h4>
                  </div>
                  <div className="rounded-2xl border border-black/[0.04] bg-white p-5 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute -right-4 -top-4 text-[#0a0a0a]/[0.02] group-hover:text-[#0a0a0a]/[0.05] transition-colors scale-150">
                      <UsersIcon />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0a0a0a]/40">Vault Savers</p>
                    <h4 className="mt-2 text-2xl font-black text-[#d4af37] font-mono tracking-tighter">
                      {formatAmount(vaultStats?.user_count || 0n)}
                    </h4>
                  </div>
                </div>

                <div className="relative rounded-2xl border border-black/[0.05] overflow-hidden bg-white p-1 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-xl transition-all">
                   <div className="sm:w-1/3 aspect-square relative rounded-xl overflow-hidden bg-[#fafafa]">
                      <img src="/mascot.png" alt="Mascot" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-700 contrast-125" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
                   </div>
                   <div className="flex-1 pr-6 pb-6 sm:pb-0">
                      <h5 className="text-sm font-black text-[#0a0a0a]/80 tracking-tight">Financial Mastery</h5>
                      <p className="mt-2 text-xs leading-relaxed text-[#0a0a0a]/40 font-bold italic">
                        The SavingsVault Protocol ensures your wealth is protected by the legendary security of Stellar. Join the elite.
                      </p>
                      <div className="mt-4 flex gap-6">
                        <div className="flex flex-col">
                           <span className="text-[9px] uppercase tracking-tighter text-[#0a0a0a]/20 font-black">Engine</span>
                           <span className="text-[11px] text-[#10b981] font-mono font-black italic underline decoration-dotted">Soroban L1</span>
                        </div>
                        <div className="flex flex-col border-l border-black/[0.05] pl-4">
                           <span className="text-[9px] uppercase tracking-tighter text-[#0a0a0a]/20 font-black">Verification</span>
                           <span className="text-[11px] text-[#d4af37] font-mono font-black italic underline decoration-dotted">Immutble</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === "deposit" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-[#d4af37]/10 bg-[#d4af37]/[0.02] p-4 flex items-center gap-4">
                   <div className="h-10 w-10 shrink-0 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                      <ArrowDownIcon />
                   </div>
                   <div className="min-w-0">
                      <p className="text-xs font-black text-[#0a0a0a]/80">Legendary Deposit</p>
                      <p className="text-[10px] text-[#0a0a0a]/40 font-bold">Secure your assets in the crystalline vault.</p>
                   </div>
                </div>
                <Input
                  label="XLM Amount to Vault"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  type="number"
                  placeholder="0.00"
                />
                {walletAddress ? (
                  <ShimmerButton onClick={handleDeposit} disabled={isDepositing} shimmerColor="#d4af37" className="w-full font-black text-sm">
                    {isDepositing ? <><SpinnerIcon /> Processing...</> : <><MoneyIcon /> Vault Assets</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    className="w-full rounded-xl border border-dashed border-black/10 bg-black/[0.01] py-4 text-xs font-bold text-[#0a0a0a]/30 hover:bg-black/[0.02] transition-all"
                  >
                    Authenticate to deposit funds
                  </button>
                )}
              </div>
            )}

            {activeTab === "withdraw" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-[#dc2626]/10 bg-[#dc2626]/[0.02] p-4 flex items-center gap-4">
                   <div className="h-10 w-10 shrink-0 rounded-full bg-[#dc2626]/10 flex items-center justify-center text-[#dc2626]">
                      <ArrowUpIcon />
                   </div>
                   <div className="min-w-0">
                      <p className="text-xs font-black text-[#0a0a0a]/80">Asset Retrieval</p>
                      <p className="text-[10px] text-[#0a0a0a]/40 font-bold">Unlock your liquidity with a single transaction.</p>
                   </div>
                </div>
                <Input
                  label="XLM Amount to Retrieve"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  type="number"
                  placeholder="0.00"
                />
                {walletAddress ? (
                  <ShimmerButton onClick={handleWithdraw} disabled={isWithdrawing} shimmerColor="#dc2626" className="w-full font-black text-sm">
                    {isWithdrawing ? <><SpinnerIcon /> Unlocking...</> : <><WalletIcon /> Retrieve Assets</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    className="w-full rounded-xl border border-dashed border-black/10 bg-black/[0.01] py-4 text-xs font-bold text-[#0a0a0a]/30 hover:bg-black/[0.02] transition-all"
                  >
                    Authenticate to withdraw funds
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-black/[0.03] px-6 py-3 flex items-center justify-between bg-black/[0.01]">
            <p className="text-[10px] text-[#0a0a0a]/40 font-black italic">SavingsVault Protocol &middot; Secure & Immutable</p>
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-1.5 opacity-60">
                 <span className="h-1 w-1 rounded-full bg-[#10b981]" />
                 <span className="font-mono text-[9px] text-[#0a0a0a] font-black italic">Verified</span>
               </span>
               <span className="flex items-center gap-1.5 opacity-60">
                 <span className="h-1 w-1 rounded-full bg-[#d4af37]" />
                 <span className="font-mono text-[9px] text-[#0a0a0a] font-black italic">Audited</span>
               </span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}



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

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#fbbf24]/30 focus-within:shadow-[0_0_20px_rgba(251,191,36,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
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
    setTxStatus("Securing your assets in the vault...");
    try {
      await deposit(walletAddress, BigInt(depositAmount));
      setTxStatus("Success! Your savings are safe.");
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
    setTxStatus("Unlocking your funds from the vault...");
    try {
      await withdraw(walletAddress, BigInt(withdrawAmount));
      setTxStatus("Withdrawal complete. Wealth released!");
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
    { key: "overview", label: "Dashboard", icon: <TrendingUpIcon />, color: "#34d399" },
    { key: "deposit", label: "Save", icon: <ArrowDownIcon />, color: "#fbbf24" },
    { key: "withdraw", label: "Withdraw", icon: <ArrowUpIcon />, color: "#f87171" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toast Handling */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Security Alert</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("complete") || txStatus.includes("Success") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#fbbf24]/20 to-[#34d399]/20 border border-white/[0.06]">
                <MoneyIcon />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white/90">Savings Vault</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20 uppercase tracking-tighter text-[9px]">Live on Testnet</Badge>
            </div>
          </div>

          {/* Wallet Info Banner */}
          {walletAddress ? (
            <div className="bg-gradient-to-r from-[#7c6cf0]/5 to-transparent px-6 py-2 border-b border-white/[0.03] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WalletIcon />
                <span className="text-[10px] font-mono text-white/40">{truncate(walletAddress)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/25">Your Balance:</span>
                <span className="text-xs font-bold text-[#34d399]">{userBalance?.toString() || "0"} XLM</span>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.02] px-6 py-2 border-b border-white/[0.03] flex items-center justify-center">
              <p className="text-[10px] text-white/20">Wallet disconnected &middot; Statistics reflect global state</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2 bg-black/20">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all group",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span className="transition-colors group-hover:scale-110" style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
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
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-white/[0.02] group-hover:text-white/[0.05] transition-colors">
                      <MoneyIcon />
                    </div>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-white/25">Total Deposits</p>
                    <h4 className="mt-2 text-2xl font-bold text-[#34d399] font-mono tracking-tight">
                      {vaultStats?.total_amount.toString() || "0"}
                      <span className="text-xs ml-1 text-white/20 font-normal uppercase">XLM</span>
                    </h4>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-white/[0.02] group-hover:text-white/[0.05] transition-colors">
                      <UsersIcon />
                    </div>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-white/25">Active Savers</p>
                    <h4 className="mt-2 text-2xl font-bold text-[#fbbf24] font-mono tracking-tight text-center sm:text-left">
                      {vaultStats?.user_count.toString() || "0"}
                    </h4>
                  </div>
                </div>

                <div className="relative rounded-2xl border border-white/[0.06] overflow-hidden bg-black/40 p-1 flex flex-col sm:flex-row items-center gap-6 group hover:border-white/[0.1] transition-all">
                   <div className="sm:w-1/3 aspect-square relative rounded-xl overflow-hidden">
                      <img src="/mascot.png" alt="Mascot" className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                   </div>
                   <div className="flex-1 pr-6 pb-6 sm:pb-0">
                      <h5 className="text-sm font-bold text-white/80">Secured Resilience</h5>
                      <p className="mt-2 text-xs leading-relaxed text-white/40">
                        Join a community of savers building their future on Stellar. Transparent, decentralized, and entirely self-custodial.
                      </p>
                      <div className="mt-4 flex gap-4">
                        <div className="flex flex-col">
                           <span className="text-[9px] uppercase tracking-tighter text-white/20 font-bold">Protocol</span>
                           <span className="text-[11px] text-emerald-400 font-mono">Soroban v1.0</span>
                        </div>
                        <div className="flex flex-col border-l border-white/10 pl-4">
                           <span className="text-[9px] uppercase tracking-tighter text-white/20 font-bold">Status</span>
                           <span className="text-[11px] text-amber-400 font-mono">Active</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === "deposit" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-[#fbbf24]/10 bg-[#fbbf24]/[0.02] p-4 flex items-center gap-4">
                   <div className="h-10 w-10 shrink-0 rounded-full bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24]">
                      <ArrowDownIcon />
                   </div>
                   <div className="min-w-0">
                      <p className="text-xs font-bold text-white/80">Grow Your Wealth</p>
                      <p className="text-[10px] text-white/40">Funds are locked securely in your user vault.</p>
                   </div>
                </div>
                <Input
                  label="Amount to Save (XLM)"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  type="number"
                  placeholder="0.00"
                />
                {walletAddress ? (
                  <ShimmerButton onClick={handleDeposit} disabled={isDepositing} shimmerColor="#fbbf24" className="w-full">
                    {isDepositing ? <><SpinnerIcon /> Processing...</> : <><MoneyIcon /> Deposit Funds</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    className="w-full rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-4 text-xs font-medium text-white/40 hover:bg-white/[0.04] transition-all"
                  >
                    Connect wallet to deposit
                  </button>
                )}
              </div>
            )}

            {activeTab === "withdraw" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-[#f87171]/10 bg-[#f87171]/[0.02] p-4 flex items-center gap-4">
                   <div className="h-10 w-10 shrink-0 rounded-full bg-[#f87171]/10 flex items-center justify-center text-[#f87171]">
                      <ArrowUpIcon />
                   </div>
                   <div className="min-w-0">
                      <p className="text-xs font-bold text-white/80">Access Your Savings</p>
                      <p className="text-[10px] text-white/40">Withdrawals are instant and permissionless.</p>
                   </div>
                </div>
                <Input
                  label="Amount to Withdraw (XLM)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  type="number"
                  placeholder="0.00"
                />
                {walletAddress ? (
                  <ShimmerButton onClick={handleWithdraw} disabled={isWithdrawing} shimmerColor="#f87171" className="w-full">
                    {isWithdrawing ? <><SpinnerIcon /> Unlocking...</> : <><WalletIcon /> Withdraw Funds</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    className="w-full rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-4 text-xs font-medium text-white/40 hover:bg-white/[0.04] transition-all"
                  >
                    Connect wallet to withdraw
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Savings Vault &middot; Powered by Soroban & Stellar</p>
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-1.5 opacity-40">
                 <span className="h-1 w-1 rounded-full bg-emerald-400" />
                 <span className="font-mono text-[9px] text-white/50">Secure</span>
               </span>
               <span className="flex items-center gap-1.5 opacity-40">
                 <span className="h-1 w-1 rounded-full bg-amber-400" />
                 <span className="font-mono text-[9px] text-white/50">Instant</span>
               </span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}


"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "info";
}

const variants = {
  default: "border-black/[0.08] bg-black/[0.04] text-black/60",
  success: "border-[#10b981]/20 bg-[#10b981]/10 text-[#059669]",
  warning: "border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d97706]",
  info: "border-blue-200 bg-blue-50 text-blue-600",
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

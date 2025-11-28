'use client';

import { ReactNode } from "react";
import { clsx } from "clsx";

interface BadgeProps {
  children: ReactNode;
  tone?: "default" | "success" | "danger" | "neutral";
}

const toneStyles: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-accent/20 text-accent ring-1 ring-accent/40",
  success: "bg-success/20 text-success ring-1 ring-success/40",
  danger: "bg-danger/20 text-danger ring-1 ring-danger/40",
  neutral: "bg-slate-800 text-slate-300 ring-1 ring-slate-700"
};

const Badge = ({ children, tone = "default" }: BadgeProps) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        toneStyles[tone]
      )}
    >
      {children}
    </span>
  );
};

export default Badge;

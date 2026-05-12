"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "stable";
  secondaryValue?: string;
  variant?: "default" | "featured";
};

export function StatsCard({
  label,
  value,
  icon,
  trend,
  secondaryValue,
  variant = "default",
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "card p-4 lg:p-5",
        variant === "featured" && "ring-2 ring-brand-500 dark:ring-brand-400",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {icon && <span className="text-brand-500">{icon}</span>}
            <p className="text-xs font-medium uppercase tracking-widest text-ink-light dark:text-slate-400">
              {label}
            </p>
          </div>
          <p className="mt-3 text-3xl font-bold text-ink dark:text-white">{value}</p>
          {secondaryValue && <p className="mt-1 text-sm text-ink-light dark:text-slate-400">{secondaryValue}</p>}
        </div>

        {trend && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              trend === "up" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
              trend === "down" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              trend === "stable" && "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
            )}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          </div>
        )}
      </div>
    </div>
  );
}

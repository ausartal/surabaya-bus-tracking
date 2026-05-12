"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, icon, badge, action, className }: PageHeaderProps) {
  return (
    <div className={cn("card mb-6 p-6 lg:p-8", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {icon && <span className="text-brand-500">{icon}</span>}
            <h1 className="text-3xl font-bold lg:text-4xl">{title}</h1>
          </div>
          {subtitle && <p className="mt-2 max-w-2xl text-ink-light dark:text-slate-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {badge && <div>{badge}</div>}
          {action && <div>{action}</div>}
        </div>
      </div>
    </div>
  );
}

"use client";

import { MapPinned, Activity, Sparkles } from "@/components/icons";
import type { LiveBus } from "@/types/transit";
import { cn } from "@/lib/utils";

type BusTrackerCardProps = {
  bus: LiveBus;
  isSelected?: boolean;
  onSelect?: () => void;
};

export function BusTrackerCard({ bus, isSelected = false, onSelect }: BusTrackerCardProps) {
  const occupancyLevel = bus.occupancy;
  const occupancyStatus =
    occupancyLevel < 30 ? "empty" : occupancyLevel < 60 ? "moderate" : occupancyLevel < 85 ? "crowded" : "full";

  const occupancyColor = {
    empty: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
    moderate: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
    crowded: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
    full: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
  };

  const occupancyBadgeColor = {
    empty: "badge-success",
    moderate: "badge-info",
    crowded: "badge-warning",
    full: "badge-error",
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "card group w-full text-left transition-all duration-300",
        "hover:shadow-hover",
        isSelected && "ring-2 ring-brand-500 ring-offset-0 dark:ring-offset-0",
      )}
    >
      {/* Header Section */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-light dark:text-slate-400">
              {bus.routeName}
            </p>
            <span className="live-dot" />
          </div>
          <h3 className="mt-1 text-lg font-bold text-ink dark:text-white">{bus.id}</h3>
          <p className="mt-1 text-sm text-ink-light dark:text-slate-400">{bus.routeTitle}</p>
        </div>
        <div
          className={cn(
            "badge",
            bus.status === "active" ? "badge-success" : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
          )}
        >
          <Activity className="mr-1 h-3 w-3" />
          {bus.status}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {/* Speed */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs text-ink-light dark:text-slate-400">Speed</p>
          <p className="mt-1 font-bold text-ink dark:text-white">{bus.speedKmh} km/h</p>
        </div>

        {/* ETA */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs text-ink-light dark:text-slate-400">ETA</p>
          <p className="mt-1 font-bold text-ink dark:text-white">{bus.etaMinutes} min</p>
        </div>

        {/* Occupancy */}
        <div className={cn("rounded-xl bg-gradient-to-br p-2.5", occupancyColor[occupancyStatus])}>
          <p className="text-xs text-ink-light dark:text-slate-400">Occupancy</p>
          <p className="mt-1 font-bold text-ink dark:text-white">{bus.occupancy}%</p>
        </div>
      </div>

      {/* Next Stop Section */}
      <div className="mb-3 rounded-xl border border-slate-200 bg-gradient-subtle p-3 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-xs uppercase tracking-wider text-ink-light dark:text-slate-400">Next Stop</p>
        <p className="mt-1.5 font-semibold text-ink dark:text-white">{bus.nextStop}</p>
      </div>

      {/* Crowding Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-ink-light dark:text-slate-400">Load Status</p>
            <span className={cn("badge text-xs", occupancyBadgeColor[occupancyStatus])}>
              {occupancyStatus === "empty"
                ? "Empty"
                : occupancyStatus === "moderate"
                  ? "Moderate"
                  : occupancyStatus === "crowded"
                    ? "Crowded"
                    : "Full"}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                occupancyStatus === "empty"
                  ? "w-[20%] bg-emerald-500"
                  : occupancyStatus === "moderate"
                    ? "w-[50%] bg-blue-500"
                    : occupancyStatus === "crowded"
                      ? "w-[75%] bg-amber-500"
                      : "w-full bg-red-500",
              )}
            />
          </div>
        </div>
      </div>

      {/* Alert if needed */}
      {occupancyStatus === "full" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 dark:border-red-900/30 dark:bg-red-900/20">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-xs font-medium text-red-700 dark:text-red-400">Bus is at full capacity</p>
        </div>
      )}
    </button>
  );
}

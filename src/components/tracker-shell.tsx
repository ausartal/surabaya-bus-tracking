"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { LocateFixed, Radar, Route, Search, Star, TimerReset, Wifi, MapPinned } from "@/components/icons";
import type { LiveSnapshot } from "@/types/transit";
import { cn, formatNumber, formatTimeAgo } from "@/lib/utils";
import { BusTrackerCard } from "./bus-tracker-card";
import { StatsCard } from "./stats-card";
import { PageHeader } from "./page-header";

const LiveMap = dynamic(() => import("@/components/live-map").then((mod) => mod.LiveMap), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[520px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" />
  ),
});

type TrackerShellProps = {
  initialSnapshot: LiveSnapshot;
};

export function TrackerShell({ initialSnapshot }: TrackerShellProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [query, setQuery] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "idle">("all");
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [favoriteRoutes, setFavoriteRoutes] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.localStorage.getItem("bus-platform-favorites");
    return saved ? (JSON.parse(saved) as string[]) : [];
  });
  const [focusedBusId, setFocusedBusId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    window.localStorage.setItem("bus-platform-favorites", JSON.stringify(favoriteRoutes));
  }, [favoriteRoutes]);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/live", { cache: "no-store" });
      const nextSnapshot = (await response.json()) as LiveSnapshot;
      setSnapshot(nextSnapshot);
    };

    const timer = window.setInterval(load, 4000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!nearbyOnly || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, [nearbyOnly]);

  const routes = snapshot.routes;

  const visibleBuses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return snapshot.buses.filter((bus) => {
      const matchesRoute = selectedRouteId === "all" || bus.routeId === selectedRouteId;
      const matchesStatus = statusFilter === "all" || bus.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        bus.id.toLowerCase().includes(normalizedQuery) ||
        bus.routeTitle.toLowerCase().includes(normalizedQuery) ||
        bus.nextStop.toLowerCase().includes(normalizedQuery);
      const matchesNearby =
        !nearbyOnly ||
        !userLocation ||
        Math.abs(bus.lat - userLocation.lat) < 0.03 ||
        Math.abs(bus.lng - userLocation.lng) < 0.03;

      return matchesRoute && matchesStatus && matchesQuery && matchesNearby;
    });
  }, [nearbyOnly, query, selectedRouteId, snapshot.buses, statusFilter, userLocation]);

  const selectedRoute = routes.find((route) => route.id === selectedRouteId);
  const favoriteRouteCards = routes.filter((route) => favoriteRoutes.includes(route.id));

  const activeBuses = visibleBuses.filter((b) => b.status === "active").length;
  const avgOccupancy = Math.round(
    visibleBuses.reduce((sum, bus) => sum + bus.occupancy, 0) / Math.max(visibleBuses.length, 1),
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1900px] space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Live Operations Center"
          subtitle="Real-time fleet tracking and monitoring dashboard"
          icon={<Radar className="h-6 w-6" />}
          badge={
            <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 dark:bg-emerald-900/30">
              <span className="live-dot" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Synced</span>
            </div>
          }
        />

        {/* Main Grid Layout */}
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* Sidebar - Filters & Info */}
          <aside className="space-y-4">
            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="card p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-light dark:text-slate-400">
                  Fleet Status
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-light dark:text-slate-400">Active Buses</span>
                    <span className="text-lg font-bold text-ink dark:text-white">{activeBuses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-light dark:text-slate-400">Avg Load</span>
                    <span className="text-lg font-bold text-ink dark:text-white">{avgOccupancy}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-light dark:text-slate-400">Avg Speed</span>
                    <span className="text-lg font-bold text-ink dark:text-white">{snapshot.metrics.averageSpeed} km/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-light dark:text-slate-400">Routes</span>
                    <span className="text-lg font-bold text-ink dark:text-white">{snapshot.metrics.totalRoutes}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="card p-0 overflow-hidden">
              <label className="block border-b border-slate-200 dark:border-slate-700 p-4 pb-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-light dark:text-slate-400 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </p>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Bus ID, route, stop..."
                  className="w-full bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </label>
            </div>

            {/* Filters */}
            <div className="card p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-light dark:text-slate-400">Filters</p>

              <select
                value={selectedRouteId}
                onChange={(event) => setSelectedRouteId(event.target.value)}
                className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 px-3 py-2.5 w-full text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All routes</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.shortName} - {route.title}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "idle")}
                className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 px-3 py-2.5 w-full text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="idle">Idle</option>
              </select>

              <button
                type="button"
                onClick={() => setNearbyOnly((current) => !current)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-sm font-medium transition text-left",
                  nearbyOnly
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/20 dark:text-brand-400"
                    : "border-slate-200 bg-white text-ink-light dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
                )}
              >
                <MapPinned className="mr-2 inline h-4 w-4" />
                Nearby Buses
              </button>
            </div>

            {/* Favorite Routes */}
            {favoriteRouteCards.length > 0 && (
              <div className="card p-4 space-y-3">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-light dark:text-slate-400">
                  <Star className="h-4 w-4 text-amber-500" />
                  Favorites
                </p>
                <div className="space-y-2">
                  {favoriteRouteCards.map((route) => (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => setSelectedRouteId(route.id)}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left transition text-sm",
                        selectedRouteId === route.id
                          ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/20"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: route.color }} />
                        <span className="font-medium">{route.shortName}</span>
                      </span>
                      <p className="mt-1 text-xs text-ink-light dark:text-slate-400">{route.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Route Info */}
            {selectedRoute && selectedRouteId !== "all" && (
              <div className="card p-4 space-y-3 bg-gradient-subtle dark:bg-slate-800/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-ink-light dark:text-slate-400">
                      {selectedRoute.shortName}
                    </p>
                    <p className="mt-1 font-bold text-ink dark:text-white">{selectedRoute.title}</p>
                    <p className="mt-1 text-xs text-ink-light dark:text-slate-400">{selectedRoute.hours}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFavoriteRoutes((current) =>
                        current.includes(selectedRoute.id)
                          ? current.filter((id) => id !== selectedRoute.id)
                          : [...current, selectedRoute.id],
                      )
                    }
                    className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        favoriteRoutes.includes(selectedRoute.id)
                          ? "fill-amber-500 text-amber-500"
                          : "text-slate-400",
                      )}
                    />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-white dark:bg-slate-700 p-2">
                    <p className="text-xs text-ink-light dark:text-slate-400">Stops</p>
                    <p className="mt-1 font-bold text-ink dark:text-white">{formatNumber(selectedRoute.stops.length)}</p>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-700 p-2">
                    <p className="text-xs text-ink-light dark:text-slate-400">Distance</p>
                    <p className="mt-1 font-bold text-ink dark:text-white">
                      {formatNumber(selectedRoute.totalDistanceKm, 1)} km
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <section className="space-y-6">
            {/* Map Section */}
            <div className="card overflow-hidden border-0">
              <div className="border-b border-slate-200 dark:border-slate-700 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 dark:text-brand-400">
                      Map View
                    </p>
                    <h2 className="mt-1 text-2xl font-bold">Real-time Fleet Canvas</h2>
                  </div>
                  <div className="text-sm text-ink-light dark:text-slate-400">
                    Updated {formatTimeAgo(snapshot.generatedAt)}
                  </div>
                </div>
              </div>
              <div className="h-[680px] overflow-hidden">
                <LiveMap
                  routes={routes}
                  buses={visibleBuses}
                  selectedRouteId={selectedRouteId}
                  focusedBusId={focusedBusId}
                />
              </div>
            </div>

            {/* Insights & Bus List */}
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              {/* Right Sidebar - Insights */}
              <div className="space-y-4 order-last lg:order-first">
                <div className="card p-4">
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-light dark:text-slate-400">
                    <Radar className="h-4 w-4" />
                    Insights
                  </p>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                      <p className="text-xs text-ink-light dark:text-slate-400">Coverage</p>
                      <p className="mt-1 font-bold text-ink dark:text-white">{snapshot.metrics.totalRoutes} routes</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                      <p className="text-xs text-ink-light dark:text-slate-400">Avg Speed</p>
                      <p className="mt-1 font-bold text-ink dark:text-white">{snapshot.metrics.averageSpeed} km/h</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                      <p className="text-xs text-ink-light dark:text-slate-400">Avg ETA</p>
                      <p className="mt-1 font-bold text-ink dark:text-white">{snapshot.metrics.averageEtaMinutes} min</p>
                    </div>
                  </div>
                </div>

                <div className="card p-4">
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-light dark:text-slate-400">
                    <TimerReset className="h-4 w-4" />
                    Tips
                  </p>
                  <ul className="space-y-2 text-xs text-ink-light dark:text-slate-400">
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                      <span>Star routes for quick access</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                      <span>Click bus cards to focus on map</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                      <span>Use filters to narrow view</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Active Fleet List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-ink dark:text-white">Active Fleet</h3>
                    <p className="mt-1 text-sm text-ink-light dark:text-slate-400">
                      {visibleBuses.length} bus{visibleBuses.length !== 1 ? "es" : ""} tracked
                    </p>
                  </div>
                  {visibleBuses.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 dark:bg-emerald-900/30">
                      <span className="live-dot h-1.5 w-1.5" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Live</span>
                    </div>
                  )}
                </div>

                <div className="grid gap-3 auto-rows-max max-h-[1200px] overflow-y-auto">
                  {visibleBuses.length > 0 ? (
                    visibleBuses.map((bus) => (
                      <BusTrackerCard
                        key={bus.id}
                        bus={bus}
                        isSelected={focusedBusId === bus.id}
                        onSelect={() => setFocusedBusId(bus.id)}
                      />
                    ))
                  ) : (
                    <div className="card p-8 text-center">
                      <p className="text-ink-light dark:text-slate-400">No buses match your filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { LocateFixed, Radar, Route, Search, Star, TimerReset, Wifi } from "@/components/icons";
import type { LiveSnapshot } from "@/types/transit";
import { cn, formatNumber, formatTimeAgo } from "@/lib/utils";

const LiveMap = dynamic(() => import("@/components/live-map").then((mod) => mod.LiveMap), {
  ssr: false,
  loading: () => <div className="h-full min-h-[520px] animate-pulse rounded-[2rem] bg-slate-200" />,
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

  return (
    <div className="min-h-screen bg-canvas px-4 py-4 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1600px] gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-glass backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-brand-500">Live tracker</p>
              <h1 className="font-sans text-3xl font-semibold">Operations center</h1>
            </div>
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <Wifi className="mr-1 inline h-3.5 w-3.5" />
              Synced
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            {[
              { label: "Active buses", value: snapshot.metrics.activeBuses },
              { label: "Avg speed", value: `${snapshot.metrics.averageSpeed} km/h` },
              { label: "Avg ETA", value: `${snapshot.metrics.averageEtaMinutes} min` },
              { label: "Routes", value: snapshot.metrics.totalRoutes },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-2 text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Search className="h-4 w-4 text-slate-400" />
              Search bus, stop, or route
            </label>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="R1-01, Purabaya, UNAIR..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand-400"
            />
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <select
              value={selectedRouteId}
              onChange={(event) => setSelectedRouteId(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
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
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
            </select>
            <button
              type="button"
              onClick={() => setNearbyOnly((current) => !current)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition",
                nearbyOnly ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-700",
              )}
            >
              Nearby buses
            </button>
          </div>

          {selectedRoute && (
            <div className="mb-4 rounded-[1.5rem] border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{selectedRoute.shortName}</p>
                  <p className="text-lg font-semibold">{selectedRoute.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{selectedRoute.hours}</p>
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
                  className="rounded-full border border-slate-200 p-2"
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      favoriteRoutes.includes(selectedRoute.id) ? "fill-accent text-accent" : "text-slate-400",
                    )}
                  />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-slate-500">Stops</p>
                  <p className="mt-1 font-semibold">{formatNumber(selectedRoute.stops.length)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-slate-500">Distance</p>
                  <p className="mt-1 font-semibold">{formatNumber(selectedRoute.totalDistanceKm, 1)} km</p>
                </div>
              </div>
            </div>
          )}

          {favoriteRouteCards.length > 0 && (
            <div className="mb-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center gap-2">
                <Route className="h-4 w-4 text-brand-500" />
                <p className="font-medium">Favorite routes</p>
              </div>
              <div className="space-y-2">
                {favoriteRouteCards.map((route) => (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => setSelectedRouteId(route.id)}
                    className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left"
                  >
                    <span>
                      <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: route.color }} />
                      {route.shortName} - {route.title}
                    </span>
                    <Star className="h-4 w-4 fill-accent text-accent" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">Active fleet</p>
              <p className="text-sm text-slate-500">{visibleBuses.length} buses</p>
            </div>
            <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
              {visibleBuses.map((bus) => (
                <button
                  key={bus.id}
                  type="button"
                  onClick={() => setFocusedBusId(bus.id)}
                  className={cn(
                    "w-full rounded-[1.5rem] border p-4 text-left transition",
                    focusedBusId === bus.id ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-200",
                  )}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{bus.routeName}</p>
                      <p className="text-lg font-semibold">{bus.id}</p>
                    </div>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", bus.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {bus.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                    <p>Speed: {bus.speedKmh} km/h</p>
                    <p>ETA: {bus.etaMinutes} min</p>
                    <p>Route: {bus.routeTitle}</p>
                    <p>Load: {bus.occupancy}%</p>
                  </div>
                  <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm">
                    <p className="text-slate-500">Next stop</p>
                    <p className="mt-1 font-medium text-slate-800">{bus.nextStop}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex min-h-[860px] flex-col gap-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-3 shadow-glass backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between px-2 pt-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-brand-500">Map view</p>
                  <h2 className="font-sans text-2xl font-semibold">Realtime fleet canvas</h2>
                </div>
                <div className="text-sm text-slate-500">Updated {formatTimeAgo(snapshot.generatedAt)}</div>
              </div>
              <div className="h-[680px] overflow-hidden rounded-[2rem]">
                <LiveMap
                  routes={routes}
                  buses={visibleBuses}
                  selectedRouteId={selectedRouteId}
                  focusedBusId={focusedBusId}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-glass backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-2">
                  <Radar className="h-4 w-4 text-brand-500" />
                  <p className="font-medium">Realtime insights</p>
                </div>
                <div className="space-y-3">
                  <div className="rounded-[1.25rem] bg-slate-50 p-3">
                    <p className="text-sm text-slate-500">Route coverage</p>
                    <p className="mt-1 text-xl font-semibold">{snapshot.metrics.totalRoutes} live corridors</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-slate-50 p-3">
                    <p className="text-sm text-slate-500">Ops average speed</p>
                    <p className="mt-1 text-xl font-semibold">{snapshot.metrics.averageSpeed} km/h</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-slate-50 p-3">
                    <p className="text-sm text-slate-500">Prediction confidence</p>
                    <p className="mt-1 text-xl font-semibold">96.2%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-glass backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-2">
                  <TimerReset className="h-4 w-4 text-brand-500" />
                  <p className="font-medium">Upcoming arrivals</p>
                </div>
                <div className="space-y-3">
                  {(visibleBuses[0]?.upcomingStops ?? []).map((stop) => (
                    <div key={stop.stopId} className="rounded-[1.25rem] bg-slate-50 p-3">
                      <p className="font-medium text-slate-800">{stop.stopName}</p>
                      <p className="mt-1 text-sm text-slate-500">{stop.etaMinutes} minutes away</p>
                    </div>
                  ))}
                  {!visibleBuses[0] && <p className="text-sm text-slate-500">No buses match the current filters.</p>}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-glass backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-2">
                  <LocateFixed className="h-4 w-4 text-brand-500" />
                  <p className="font-medium">Rider tools</p>
                </div>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="rounded-[1.25rem] bg-slate-50 p-3">Save routes for one-tap tracking.</div>
                  <div className="rounded-[1.25rem] bg-slate-50 p-3">Use Nearby to discover buses around your location.</div>
                  <div className="rounded-[1.25rem] bg-slate-50 p-3">Tap a fleet card to focus a specific vehicle on the map.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

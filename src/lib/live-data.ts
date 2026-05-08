import type { LiveBus, LiveSnapshot, TransitRoute } from "@/types/transit";
import { distanceBetween, getTransitCenter, getTransitRoutes, interpolateOnPath } from "@/lib/transit-data";

function createSeedFromText(value: string) {
  return value.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
}

function busCountForRoute(route: TransitRoute) {
  if (!route.feeder) return 4;
  if (route.totalDistanceKm > 18) return 3;
  return 2;
}

function getNextStops(route: TransitRoute, progress: number, speedKmh: number) {
  const sortedStops = route.stops;
  const ahead = sortedStops.filter((stop) => stop.progress >= progress);
  const wrapped = sortedStops.filter((stop) => stop.progress < progress);
  const queue = [...ahead, ...wrapped].slice(0, 3);

  return queue.map((stop) => {
    const stopProgress = stop.progress >= progress ? stop.progress : stop.progress + 1;
    const distanceKm = (stopProgress - progress) * route.totalDistanceKm;
    const etaMinutes = speedKmh <= 0 ? 0 : (distanceKm / speedKmh) * 60;

    return {
      stopId: stop.id,
      stopName: stop.name,
      etaMinutes: Math.max(1, Math.round(etaMinutes)),
    };
  });
}

function generateBus(route: TransitRoute, index: number, now: Date): LiveBus {
  const seed = createSeedFromText(`${route.id}-${index}`);
  const cycleMinutes = route.feeder ? 38 : 54;
  const nowSeconds = now.getTime() / 1000;
  const offset = ((seed % 100) / 100 + index / (busCountForRoute(route) + 1)) % 1;
  const timeProgress = (nowSeconds / (cycleMinutes * 60) + offset) % 1;
  const speedKmh = Math.round((route.feeder ? 23 : 31) + Math.sin(nowSeconds / 90 + seed) * 5 + (seed % 3));
  const point = interpolateOnPath(route, timeProgress);
  const upcomingStops = getNextStops(route, timeProgress, speedKmh);
  const nextStop = upcomingStops[0]?.stopName ?? "Terminal";
  const etaMinutes = upcomingStops[0]?.etaMinutes ?? 0;

  return {
    id: `${route.shortName.replace(/\s+/g, "")}-${String(index + 1).padStart(2, "0")}`,
    routeId: route.id,
    routeCode: route.code,
    routeName: route.shortName,
    routeTitle: route.title,
    speedKmh,
    status: speedKmh > 8 ? "active" : "idle",
    nextStop,
    etaMinutes,
    lat: point.lat,
    lng: point.lng,
    heading: point.heading,
    occupancy: 35 + ((seed + now.getMinutes() * 7) % 61),
    updatedAt: now.toISOString(),
    upcomingStops,
  };
}

export function getLiveSnapshot() {
  const routes = getTransitRoutes();
  const now = new Date();
  const buses = routes.flatMap((route) =>
    Array.from({ length: busCountForRoute(route) }, (_, index) => generateBus(route, index, now)),
  );

  const metrics = {
    totalRoutes: routes.length,
    activeBuses: buses.filter((bus) => bus.status === "active").length,
    averageSpeed: Math.round(buses.reduce((total, bus) => total + bus.speedKmh, 0) / buses.length),
    averageEtaMinutes: Math.round(buses.reduce((total, bus) => total + bus.etaMinutes, 0) / buses.length),
  };

  return {
    generatedAt: now.toISOString(),
    center: getTransitCenter(),
    routes,
    buses,
    metrics,
  } satisfies LiveSnapshot;
}

export function getNearbyBuses(center: { lat: number; lng: number }, maxDistanceKm = 3) {
  return getLiveSnapshot().buses.filter((bus) => distanceBetween(center, { lat: bus.lat, lng: bus.lng }) <= maxDistanceKm);
}

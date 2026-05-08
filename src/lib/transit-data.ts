import routesJson from "../../routedata.json";
import halteJson from "../../halte.json";
import type { LatLng, TransitRoute, TransitStop } from "@/types/transit";

type RawRoute = {
  code: string;
  link: string;
  feeder: boolean;
  name: string;
  title: string;
  color: string;
  text: string;
  hours: string;
  datarute: { lat: string; lon: string }[];
  datahalte: { a?: Array<number | string>; b?: Array<number | string> };
};

type RawStop = {
  uniqid: number;
  nama: string;
  lat: string;
  lon: string;
  transit: string[];
};

const rawRoutes = routesJson as unknown as Record<string, RawRoute>;
const rawStops = (halteJson as { halte: RawStop[] }).halte;

const stopLookup = new Map<number, RawStop>(rawStops.map((stop) => [stop.uniqid, stop]));

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(a: LatLng, b: LatLng) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const aa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(a.lat)) *
      Math.cos(toRadians(b.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

function buildPath(points: RawRoute["datarute"]) {
  return points.map((point) => ({
    lat: Number(point.lat),
    lng: Number(point.lon),
  }));
}

function routeDistances(path: LatLng[]) {
  const cumulative = [0];
  for (let index = 1; index < path.length; index += 1) {
    cumulative[index] = cumulative[index - 1] + distanceKm(path[index - 1], path[index]);
  }
  return cumulative;
}

function nearestPointIndex(path: LatLng[], stop: LatLng) {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < path.length; index += 1) {
    const currentDistance = distanceKm(path[index], stop);
    if (currentDistance < bestDistance) {
      bestDistance = currentDistance;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function uniqueStopIds(route: RawRoute) {
  const combined = [...(route.datahalte.a ?? []), ...(route.datahalte.b ?? [])];
  return [...new Set(combined.map((stopId) => Number(stopId)).filter((stopId) => Number.isFinite(stopId)))];
}

let cache: TransitRoute[] | null = null;

export function getTransitRoutes() {
  if (cache) return cache;

  cache = Object.entries(rawRoutes).map(([id, route]) => {
    const path = buildPath(route.datarute);
    const cumulative = routeDistances(path);
    const totalDistanceKm = cumulative[cumulative.length - 1] ?? 0;

    const stops: TransitStop[] = uniqueStopIds(route)
      .map((stopId) => stopLookup.get(stopId))
      .filter((stop): stop is RawStop => Boolean(stop))
      .map((stop) => {
        const stopPoint = {
          lat: Number(stop.lat),
          lng: Number(stop.lon),
        };
        const pointIndex = nearestPointIndex(path, stopPoint);

        return {
          id: stop.uniqid,
          name: stop.nama,
          lat: stopPoint.lat,
          lng: stopPoint.lng,
          routes: stop.transit,
          progress: totalDistanceKm === 0 ? 0 : cumulative[pointIndex] / totalDistanceKm,
          pointIndex,
        };
      })
      .sort((left, right) => left.progress - right.progress);

    return {
      id,
      code: Number(route.code),
      shortName: route.name,
      title: route.title,
      color: route.color,
      textColor: route.text,
      hours: route.hours,
      feeder: route.feeder,
      path,
      stops,
      totalDistanceKm,
    } satisfies TransitRoute;
  });

  return cache;
}

export function getTransitCenter() {
  const routes = getTransitRoutes();
  const coordinates = routes.flatMap((route) => route.path);
  const total = coordinates.reduce(
    (accumulator, point) => ({
      lat: accumulator.lat + point.lat,
      lng: accumulator.lng + point.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: total.lat / coordinates.length,
    lng: total.lng / coordinates.length,
  };
}

export function interpolateOnPath(route: TransitRoute, progress: number) {
  const targetDistance = route.totalDistanceKm * progress;
  let covered = 0;

  for (let index = 1; index < route.path.length; index += 1) {
    const start = route.path[index - 1];
    const end = route.path[index];
    const segmentDistance = distanceKm(start, end);

    if (covered + segmentDistance >= targetDistance) {
      const ratio = segmentDistance === 0 ? 0 : (targetDistance - covered) / segmentDistance;
      return {
        lat: start.lat + (end.lat - start.lat) * ratio,
        lng: start.lng + (end.lng - start.lng) * ratio,
        heading: (Math.atan2(end.lng - start.lng, end.lat - start.lat) * 180) / Math.PI,
      };
    }

    covered += segmentDistance;
  }

  const lastPoint = route.path[route.path.length - 1];
  const previousPoint = route.path[route.path.length - 2] ?? lastPoint;
  return {
    lat: lastPoint.lat,
    lng: lastPoint.lng,
    heading: (Math.atan2(lastPoint.lng - previousPoint.lng, lastPoint.lat - previousPoint.lat) * 180) / Math.PI,
  };
}

export function distanceBetween(a: LatLng, b: LatLng) {
  return distanceKm(a, b);
}

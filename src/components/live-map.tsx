"use client";

import { MapContainer, Marker, Pane, Polyline, Popup, TileLayer, CircleMarker } from "react-leaflet";
import { DivIcon } from "leaflet";
import type { LiveBus, TransitRoute } from "@/types/transit";

type LiveMapProps = {
  routes: TransitRoute[];
  buses: LiveBus[];
  selectedRouteId: string;
  focusedBusId: string | null;
};

function routeBusIcon(color: string) {
  return new DivIcon({
    className: "",
    html: `<div style="background:${color};width:42px;height:42px;border-radius:16px;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.95);box-shadow:0 18px 32px rgba(15,23,42,.28);transform:rotate(-8deg);"><div style="width:12px;height:12px;border-radius:999px;background:white;"></div></div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

export function LiveMap({ routes, buses, selectedRouteId, focusedBusId }: LiveMapProps) {
  const visibleRoutes = selectedRouteId === "all" ? routes : routes.filter((route) => route.id === selectedRouteId);
  const visibleRouteIds = new Set(visibleRoutes.map((route) => route.id));
  const visibleBuses = buses.filter((bus) => visibleRouteIds.has(bus.routeId));
  const mapCenter = visibleBuses[0]
    ? { lat: visibleBuses[0].lat, lng: visibleBuses[0].lng }
    : { lat: -7.2892, lng: 112.7344 };

  return (
    <MapContainer center={mapCenter} zoom={12.8} scrollWheelZoom className="h-full w-full rounded-[2rem]">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {visibleRoutes.map((route) => (
        <Pane key={route.id} name={`route-${route.id}`}>
          <Polyline
            pathOptions={{
              color: route.color,
              weight: selectedRouteId === route.id ? 7 : 5,
              opacity: selectedRouteId === "all" ? 0.62 : 0.92,
            }}
            positions={route.path.map((point) => [point.lat, point.lng])}
          />
          {selectedRouteId !== "all" &&
            route.stops.map((stop) => (
              <CircleMarker
                key={stop.id}
                center={[stop.lat, stop.lng]}
                radius={6}
                pathOptions={{ color: "#0f172a", fillColor: "#ffffff", fillOpacity: 1, weight: 2 }}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{stop.name}</p>
                    <p className="text-xs text-slate-500">{stop.routes.length} connected routes</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
        </Pane>
      ))}

      {visibleBuses.map((bus) => {
        const route = routes.find((routeItem) => routeItem.id === bus.routeId);
        return (
          <Marker
            key={bus.id}
            position={[bus.lat, bus.lng]}
            icon={routeBusIcon(route?.color ?? "#1D4ED8")}
            zIndexOffset={focusedBusId === bus.id ? 600 : 300}
          >
            <Popup>
              <div className="min-w-56 space-y-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{bus.routeName}</p>
                  <p className="font-semibold text-slate-900">{bus.id}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                  <p>Speed: {bus.speedKmh} km/h</p>
                  <p>ETA: {bus.etaMinutes} min</p>
                  <p>Status: {bus.status}</p>
                  <p>Occupancy: {bus.occupancy}%</p>
                </div>
                <p className="text-sm text-slate-700">Next stop: {bus.nextStop}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

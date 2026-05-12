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

function routeBusIcon(color: string, isFocused: boolean = false) {
  const size = isFocused ? 52 : 42;
  const innerSize = isFocused ? 16 : 12;

  return new DivIcon({
    className: "",
    html: `<div style="
      background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
      width: ${size}px;
      height: ${size}px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1);
      position: relative;
      transition: all 0.3s ease;
    ">
      <div style="
        width: ${innerSize}px;
        height: ${innerSize}px;
        border-radius: 50%;
        background: white;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
      "></div>
      ${isFocused ? `<div style="position: absolute; width: ${size + 8}px; height: ${size + 8}px; border: 2px solid ${color}66; border-radius: 16px; animation: pulse 2s infinite;"></div>` : ""}
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 10)],
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
    <MapContainer center={mapCenter} zoom={12.8} scrollWheelZoom className="h-full w-full rounded-2xl">
      <style>{`
        @keyframes pulse {
          0% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 0.5;
            transform: scale(1.3);
          }
        }
      `}</style>

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {visibleRoutes.map((route) => (
        <Pane key={route.id} name={`route-${route.id}`}>
          <Polyline
            pathOptions={{
              color: route.color,
              weight: selectedRouteId === route.id ? 6 : 4,
              opacity: selectedRouteId === "all" ? 0.5 : 0.8,
              lineCap: "round",
              lineJoin: "round",
            }}
            positions={route.path.map((point) => [point.lat, point.lng])}
          />
          {selectedRouteId !== "all" &&
            route.stops.map((stop) => (
              <CircleMarker
                key={stop.id}
                center={[stop.lat, stop.lng]}
                radius={5}
                pathOptions={{
                  color: route.color,
                  fillColor: "white",
                  fillOpacity: 1,
                  weight: 2.5,
                }}
              >
                <Popup className="custom-popup">
                  <div className="min-w-56 space-y-2 p-1">
                    <div>
                      <p className="font-semibold text-slate-900">{stop.name}</p>
                      <p className="text-xs text-slate-500">{stop.routes.length} connected routes</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-xs font-medium text-slate-600">Routes serving this stop</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {stop.routes.map((routeId) => {
                          const routeInfo = routes.find((r) => r.id === routeId);
                          return (
                            <span
                              key={routeId}
                              className="rounded px-2 py-0.5 text-xs font-medium text-white"
                              style={{ backgroundColor: routeInfo?.color }}
                            >
                              {routeInfo?.shortName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
        </Pane>
      ))}

      {visibleBuses.map((bus) => {
        const route = routes.find((routeItem) => routeItem.id === bus.routeId);
        const isFocused = focusedBusId === bus.id;

        return (
          <Marker
            key={bus.id}
            position={[bus.lat, bus.lng]}
            icon={routeBusIcon(route?.color ?? "#4f46e5", isFocused)}
            zIndexOffset={isFocused ? 1000 : 300}
          >
            <Popup className="custom-popup">
              <div className="min-w-64 space-y-3 p-2">
                <div className="border-b border-slate-200 pb-2">
                  <p className="text-xs uppercase tracking-wider font-medium text-slate-500">{bus.routeName}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{bus.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs text-slate-500">Speed</p>
                    <p className="mt-0.5 font-semibold text-slate-900">{bus.speedKmh} km/h</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs text-slate-500">ETA</p>
                    <p className="mt-0.5 font-semibold text-slate-900">{bus.etaMinutes} min</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="mt-0.5 font-semibold text-slate-900 capitalize">{bus.status}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs text-slate-500">Occupancy</p>
                    <p className="mt-0.5 font-semibold text-slate-900">{bus.occupancy}%</p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <p className="text-xs text-slate-500">Next Stop</p>
                  <p className="mt-1 font-semibold text-slate-900">{bus.nextStop}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

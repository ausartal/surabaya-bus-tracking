export type LatLng = {
  lat: number;
  lng: number;
};

export type TransitStop = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  routes: string[];
  progress: number;
  pointIndex: number;
};

export type TransitRoute = {
  id: string;
  code: number;
  shortName: string;
  title: string;
  color: string;
  textColor: string;
  hours: string;
  feeder: boolean;
  path: LatLng[];
  stops: TransitStop[];
  totalDistanceKm: number;
};

export type BusEta = {
  stopId: number;
  stopName: string;
  etaMinutes: number;
};

export type LiveBus = {
  id: string;
  routeId: string;
  routeCode: number;
  routeName: string;
  routeTitle: string;
  speedKmh: number;
  status: "active" | "idle";
  nextStop: string;
  etaMinutes: number;
  lat: number;
  lng: number;
  heading: number;
  occupancy: number;
  updatedAt: string;
  upcomingStops: BusEta[];
};

export type LiveSnapshot = {
  generatedAt: string;
  center: LatLng;
  routes: TransitRoute[];
  buses: LiveBus[];
  metrics: {
    totalRoutes: number;
    activeBuses: number;
    averageSpeed: number;
    averageEtaMinutes: number;
  };
};

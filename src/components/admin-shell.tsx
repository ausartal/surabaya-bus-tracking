import { Activity, Bus, ChartColumn, MapPinned, PencilLine, Route, ShieldCheck } from "@/components/icons";
import { getLiveSnapshot } from "@/lib/live-data";
import { formatNumber } from "@/lib/utils";

export function AdminShell() {
  const snapshot = getLiveSnapshot();
  const routes = snapshot.routes;
  const busiestRoutes = [...routes]
    .sort((left, right) => right.stops.length - left.stops.length)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-canvas px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glass backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-500">Admin console</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-sans text-4xl font-semibold text-slate-950">Fleet operations dashboard</h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Manage routes, monitor live operations, and keep the network healthy with one command center.
              </p>
            </div>
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              <ShieldCheck className="mr-2 inline h-4 w-4" />
              Realtime feed healthy
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Active buses", value: snapshot.metrics.activeBuses, icon: Bus },
            { label: "Monitored routes", value: snapshot.metrics.totalRoutes, icon: Route },
            { label: "Registered stops", value: routes.reduce((total, route) => total + route.stops.length, 0), icon: MapPinned },
            { label: "Average speed", value: `${snapshot.metrics.averageSpeed} km/h`, icon: Activity },
          ].map((card) => (
            <div key={card.label} className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-glass backdrop-blur-xl">
              <card.icon className="h-5 w-5 text-brand-500" />
              <p className="mt-4 text-sm text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-glass backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <ChartColumn className="h-4 w-4 text-brand-500" />
              <p className="font-medium text-slate-900">Route performance</p>
            </div>
            <div className="space-y-3">
              {busiestRoutes.map((route, index) => (
                <div key={route.id} className="rounded-[1.5rem] bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{route.shortName}</p>
                      <p className="text-lg font-semibold text-slate-900">{route.title}</p>
                    </div>
                    <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: `${route.color}18`, color: route.color }}>
                      #{index + 1} demand
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm text-slate-600">
                    <p>{formatNumber(route.stops.length)} stops</p>
                    <p>{formatNumber(route.totalDistanceKm, 1)} km</p>
                    <p>{route.feeder ? "Feeder" : "Trunk"} service</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-glass backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2">
                <PencilLine className="h-4 w-4 text-brand-500" />
                <p className="font-medium text-slate-900">Management actions</p>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="rounded-[1.5rem] bg-slate-50 p-4">Add, edit, or archive routes with route-level stop validation.</div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">Assign buses to corridors and inspect live vehicle health in one queue.</div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">Track route performance, on-time expectations, and network density trends.</div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-glass backdrop-blur-xl">
              <p className="text-sm font-medium text-slate-900">Analytics snapshot</p>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm text-slate-500">
                    <span>Fleet utilization</span>
                    <span>84%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-brand-500" style={{ width: "84%" }} />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm text-slate-500">
                    <span>ETA confidence</span>
                    <span>96%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-sky-500" style={{ width: "96%" }} />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm text-slate-500">
                    <span>Route completion</span>
                    <span>91%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-accent" style={{ width: "91%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

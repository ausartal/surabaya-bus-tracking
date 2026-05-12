import { Activity, Bus, ChartColumn, MapPinned, AlertCircle, TrendingUp, Zap, PencilLine, ShieldCheck } from "@/components/icons";
import { getLiveSnapshot } from "@/lib/live-data";
import { formatNumber } from "@/lib/utils";
import { StatsCard } from "./stats-card";
import { PageHeader } from "./page-header";

export function AdminShell() {
  const snapshot = getLiveSnapshot();
  const routes = snapshot.routes;
  const totalStops = routes.reduce((total, route) => total + route.stops.length, 0);
  
  const busiestRoutes = [...routes]
    .sort((left, right) => right.stops.length - left.stops.length)
    .slice(0, 5);

  const metrics = {
    fleetUtilization: 84,
    etaConfidence: 96,
    routeCompletion: 91,
    onTimePerformance: 88,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1900px] space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Fleet Operations Dashboard"
          subtitle="Manage routes, monitor live operations, and keep the network healthy"
          icon={<ChartColumn className="h-6 w-6" />}
          badge={
            <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 dark:bg-emerald-900/30">
              <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">System Healthy</span>
            </div>
          }
        />

        {/* KPI Cards Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatsCard
            label="Active Buses"
            value={snapshot.metrics.activeBuses}
            icon={<Bus className="h-5 w-5" />}
            trend="up"
          />
          <StatsCard
            label="Routes Operating"
            value={snapshot.metrics.totalRoutes}
            icon={<TrendingUp className="h-5 w-5" />}
            trend="stable"
          />
          <StatsCard
            label="Registered Stops"
            value={totalStops}
            icon={<MapPinned className="h-5 w-5" />}
            trend="stable"
          />
          <StatsCard
            label="Avg Speed"
            value={`${snapshot.metrics.averageSpeed} km/h`}
            icon={<Activity className="h-5 w-5" />}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Route Performance */}
          <div className="col-span-2 card p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-ink dark:text-white">Route Performance</h2>
                <p className="mt-1 text-sm text-ink-light dark:text-slate-400">Top routes by demand</p>
              </div>
              <ChartColumn className="h-6 w-6 text-brand-500" />
            </div>

            <div className="space-y-3">
              {busiestRoutes.map((route, index) => {
                const demandLevel = ((index + 1) / 5) * 100;
                const demandColor = demandLevel > 80 ? "from-red-500 to-red-600" : demandLevel > 60 ? "from-amber-500 to-amber-600" : "from-emerald-500 to-emerald-600";

                return (
                  <div key={route.id} className="group rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition hover:border-brand-400 dark:hover:border-brand-400">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: route.color }}
                          />
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-ink-light dark:text-slate-400">
                              {route.shortName}
                            </p>
                            <p className="mt-0.5 font-bold text-ink dark:text-white">{route.title}</p>
                          </div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${demandColor} px-3 py-1.5`}>
                        <TrendingUp className="h-3 w-3 text-white" />
                        <span className="text-xs font-semibold text-white">#{index + 1}</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                      <div>
                        <p className="text-xs text-ink-light dark:text-slate-400">Stops</p>
                        <p className="mt-1 font-bold text-ink dark:text-white">{formatNumber(route.stops.length)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-light dark:text-slate-400">Distance</p>
                        <p className="mt-1 font-bold text-ink dark:text-white">{formatNumber(route.totalDistanceKm, 1)} km</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-light dark:text-slate-400">Type</p>
                        <p className="mt-1 font-bold text-ink dark:text-white">{route.feeder ? "Feeder" : "Trunk"}</p>
                      </div>
                    </div>

                    {/* Demand Bar */}
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-ink-light dark:text-slate-400">Demand Level</span>
                        <span className="text-xs font-bold text-ink dark:text-white">{demandLevel.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${demandColor} transition-all duration-500`}
                          style={{ width: `${demandLevel}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Metrics Dashboard */}
            <div className="card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand-500" />
                <h3 className="font-bold text-ink dark:text-white">System Metrics</h3>
              </div>

              <div className="space-y-4">
                {/* Utilization */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-ink dark:text-white">Fleet Utilization</span>
                    <span className="text-sm font-bold text-brand-500">{metrics.fleetUtilization}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${metrics.fleetUtilization}%` }}
                    />
                  </div>
                </div>

                {/* ETA Confidence */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-ink dark:text-white">ETA Confidence</span>
                    <span className="text-sm font-bold text-brand-500">{metrics.etaConfidence}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${metrics.etaConfidence}%` }}
                    />
                  </div>
                </div>

                {/* Route Completion */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-ink dark:text-white">Route Completion</span>
                    <span className="text-sm font-bold text-brand-500">{metrics.routeCompletion}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${metrics.routeCompletion}%` }}
                    />
                  </div>
                </div>

                {/* On-time Performance */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-ink dark:text-white">On-time Performance</span>
                    <span className="text-sm font-bold text-brand-500">{metrics.onTimePerformance}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{ width: `${metrics.onTimePerformance}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-brand-500" />
                <h3 className="font-bold text-ink dark:text-white">Quick Actions</h3>
              </div>

              <div className="space-y-2">
                <button className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-left text-sm font-medium text-ink dark:text-white transition hover:border-brand-400 hover:bg-Brand-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <PencilLine className="h-4 w-4 text-brand-500" />
                  Edit Routes
                </button>
                <button className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-left text-sm font-medium text-ink dark:text-white transition hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <Bus className="h-4 w-4 text-brand-500" />
                  Assign Buses
                </button>
                <button className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-left text-sm font-medium text-ink dark:text-white transition hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-brand-500" />
                  View Alerts
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="card p-6 bg-gradient-subtle dark:bg-slate-800/50">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-light dark:text-slate-400 mb-4">
                System Status
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink dark:text-white">API Health</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink dark:text-white">Database</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink dark:text-white">GPS Tracking</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

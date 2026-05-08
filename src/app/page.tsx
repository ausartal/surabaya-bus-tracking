import Link from "next/link";
import { LandingPreview } from "@/components/landing-preview";
import { ArrowRight, Bus, MapPinned, Radar, Sparkles, TimerReset } from "@/components/icons";
import { getLiveSnapshot } from "@/lib/live-data";
import { formatNumber } from "@/lib/utils";

const workflow = ["GPS data emitted from each vehicle", "Realtime ingestion and processing", "Dynamic map rendering and ETAs", "Passenger and operator visibility"];

export default function HomePage() {
  const snapshot = getLiveSnapshot();

  return (
    <main className="bg-canvas text-slate-900">
      <section className="relative overflow-hidden bg-hero-grid">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.3),rgba(248,250,252,1))]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
          <div className="mb-16 flex items-center justify-between rounded-full border border-white/70 bg-white/70 px-4 py-3 shadow-glass backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">BusFlow</p>
                <p className="text-sm text-slate-500">Modern fleet intelligence</p>
              </div>
            </div>
            <div className="hidden items-center gap-3 text-sm text-slate-600 md:flex">
              <Link href="/tracker">Live Tracker</Link>
              <Link href="/admin">Admin</Link>
            </div>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Realtime transit experience
              </span>
              <h1 className="mt-6 max-w-2xl font-display text-5xl font-semibold leading-tight text-slate-950 lg:text-7xl">
                Track Your Bus in Real-Time
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                A premium bus tracking platform for riders and operators, combining live maps, accurate ETAs, route intelligence, and a polished command-center interface.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/tracker"
                  className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Start Tracking
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900"
                >
                  Open Admin Dashboard
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Active buses", value: snapshot.metrics.activeBuses },
                  { label: "Tracked routes", value: snapshot.metrics.totalRoutes },
                  { label: "Average ETA", value: `${snapshot.metrics.averageEtaMinutes} min` },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[1.5rem] border border-white/60 bg-white/70 p-4 shadow-glass backdrop-blur-xl">
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <LandingPreview />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand-500">Features</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-slate-950">Built for passengers and operators</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: Radar, title: "Realtime tracking", text: "Live bus movement with smooth updates and active fleet status." },
            { icon: MapPinned, title: "Route visualization", text: "Interactive route layers, stop markers, and focused corridor views." },
            { icon: TimerReset, title: "ETA prediction", text: "Countdowns to upcoming stops based on dynamic vehicle movement." },
            { icon: Bus, title: "Multi-bus monitoring", text: "Track multiple vehicles across trunk and feeder routes at once." },
          ].map((feature) => (
            <div key={feature.title} className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-glass">
              <feature.icon className="h-5 w-5 text-brand-500" />
              <h3 className="mt-5 font-display text-2xl font-semibold text-slate-950">{feature.title}</h3>
              <p className="mt-3 text-slate-600">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-float">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-300">How it works</p>
            <h2 className="mt-3 font-display text-4xl font-semibold">GPS to dashboard, without friction</h2>
            <div className="mt-8 space-y-4">
              {workflow.map((step, index) => (
                <div key={step} className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 font-semibold text-sky-300">
                    {index + 1}
                  </div>
                  <p className="pt-2 text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-glass">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-brand-500">App preview</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-slate-950">A dashboard that feels production-ready</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { label: "Network span", value: `${formatNumber(snapshot.routes.reduce((total, route) => total + route.totalDistanceKm, 0), 0)} km` },
                { label: "Stops indexed", value: formatNumber(snapshot.routes.reduce((total, route) => total + route.stops.length, 0)) },
                { label: "Average speed", value: `${snapshot.metrics.averageSpeed} km/h` },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.75rem] bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_50%,#fef9c3_100%)] p-6">
              <div className="grid gap-4 md:grid-cols-[1fr_0.9fr]">
                <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-glass">
                  <p className="text-sm text-slate-500">Live insights</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{snapshot.metrics.activeBuses} buses moving now</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">Filtered route monitoring</div>
                    <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">Favorites and nearby discovery</div>
                    <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">Admin analytics for route performance</div>
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-slate-950 p-4 text-white">
                  <p className="text-sm text-slate-400">Command feed</p>
                  <div className="mt-4 space-y-3">
                    {snapshot.buses.slice(0, 3).map((bus) => (
                      <div key={bus.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="font-medium">
                          {bus.id} <span className="text-slate-400">on {bus.routeTitle}</span>
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          {bus.speedKmh} km/h · ETA {bus.etaMinutes} min · Next {bus.nextStop}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2.25rem] border border-white/70 bg-[linear-gradient(135deg,#1D4ED8_0%,#0EA5E9_55%,#EAB308_160%)] p-8 text-white shadow-float lg:p-12">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-100">Ready to launch</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-4xl font-semibold">Open Live Tracker</h2>
              <p className="mt-3 text-lg text-sky-50">
                Move from static route information to a polished realtime transit platform that feels fast, clear, and reliable.
              </p>
            </div>
            <Link
              href="/tracker"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-600"
            >
              Start live monitoring
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>BusFlow transit platform for realtime bus operations.</p>
          <div className="flex items-center gap-4">
            <Link href="/tracker">Live Tracker</Link>
            <Link href="/admin">Admin Console</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

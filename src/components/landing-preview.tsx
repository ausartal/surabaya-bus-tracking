"use client";

import { motion } from "framer-motion";
import { Bus, MapPinned, Radio, Sparkles } from "@/components/icons";

const features = [
  { icon: Radio, label: "Realtime vehicle feed" },
  { icon: MapPinned, label: "Map-first route visualization" },
  { icon: Bus, label: "Multi-bus monitoring" },
  { icon: Sparkles, label: "Operator-grade dashboard" },
];

export function LandingPreview() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/65 p-5 shadow-float backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(234,179,8,0.18),_transparent_28%)]" />
      <div className="relative grid gap-5 lg:grid-cols-[1.25fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-slate-200/70 bg-slate-950 p-4 text-white">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Live map</p>
              <h3 className="mt-1 font-sans text-2xl font-semibold">Surabaya Operations</h3>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-300">
              Connected
            </span>
          </div>
          <div className="relative h-[320px] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#082f49_0%,#0f172a_50%,#1e3a8a_100%)]">
            <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
            <svg viewBox="0 0 600 360" className="absolute inset-0 h-full w-full">
              <path d="M35 285 C100 210, 180 185, 260 198 S430 244, 564 116" fill="none" stroke="rgba(14,165,233,0.9)" strokeWidth="10" strokeLinecap="round" />
              <path d="M62 96 C138 132, 198 170, 262 154 S394 82, 530 172" fill="none" stroke="rgba(234,179,8,0.95)" strokeWidth="8" strokeLinecap="round" />
              <path d="M83 310 C166 282, 264 292, 350 256 S480 160, 550 214" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="4" strokeDasharray="10 10" strokeLinecap="round" />
            </svg>
            {[{ left: "20%", top: "64%", color: "#1D4ED8" }, { left: "46%", top: "54%", color: "#0EA5E9" }, { left: "70%", top: "34%", color: "#EAB308" }].map((bus, index) => (
              <motion.div
                key={bus.left}
                className="absolute flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 shadow-glass"
                style={{ left: bus.left, top: bus.top, backgroundColor: bus.color }}
                animate={{ y: [0, -8, 0], x: [0, index % 2 === 0 ? 10 : -8, 0] }}
                transition={{ duration: 4 + index, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <Bus className="h-5 w-5 text-white" />
              </motion.div>
            ))}
            <div className="absolute bottom-4 left-4 rounded-2xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 backdrop-blur-md">
              32 active buses across 16 routes
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-glass backdrop-blur-xl"
            >
              <feature.icon className="mb-3 h-5 w-5 text-brand-500" />
              <p className="font-medium text-slate-900">{feature.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

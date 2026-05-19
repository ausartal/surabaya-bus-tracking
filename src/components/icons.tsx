import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </BaseIcon>
  );
}

export function Bus(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="5" y="4" width="14" height="13" rx="3" />
      <path d="M8 17v3M16 17v3M7 9h10M9 13h.01M15 13h.01" />
    </BaseIcon>
  );
}

export function MapPinned(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </BaseIcon>
  );
}

export function Radar(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 12 19 5" />
      <path d="M5 19a10 10 0 0 1 14-14" />
      <path d="M8 16a6 6 0 0 1 8-8" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

export function Sparkles(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="m19 15 .7 2 .3.8.8.3 2 .7-2 .7-.8.3-.3.8-.7 2-.7-2-.3-.8-.8-.3-2-.7 2-.7.8-.3.3-.8.7-2Z" />
    </BaseIcon>
  );
}

export function TimerReset(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M10 2h4M12 8v5l3 2" />
      <path d="M4 4v5h5" />
      <path d="M5 9a8 8 0 1 0 3-5.8" />
    </BaseIcon>
  );
}

export function LocateFixed(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="8" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </BaseIcon>
  );
}

export function Route(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h4a4 4 0 0 0 4-4V8" />
    </BaseIcon>
  );
}

export function Search(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </BaseIcon>
  );
}

export function Star(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z" />
    </BaseIcon>
  );
}

export function Wifi(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M2.5 8.5a15 15 0 0 1 19 0" />
      <path d="M5.5 12a10.5 10.5 0 0 1 13 0" />
      <path d="M8.8 15.5a6 6 0 0 1 6.4 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

export function Activity(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    </BaseIcon>
  );
}

export function ChartColumn(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20v-11" />
    </BaseIcon>
  );
}

export function TrendingUp(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 17 9 11l4 4 8-8" />
      <path d="M14 7h7v7" />
    </BaseIcon>
  );
}

export function PencilLine(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m15 5 4 4" />
      <path d="M4 20h4l10-10-4-4L4 16v4Z" />
      <path d="M4 20h16" />
    </BaseIcon>
  );
}

export function ShieldCheck(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3 5 6v5c0 5 3.2 8 7 10 3.8-2 7-5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </BaseIcon>
  );
}

export function Radio(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="2" />
      <path d="M4.9 4.9a10 10 0 0 1 14.2 0" />
      <path d="M7.8 7.8a6 6 0 0 1 8.4 0" />
      <path d="M2.8 2.8a14 14 0 0 1 18.4 0" />
    </BaseIcon>
  );
}

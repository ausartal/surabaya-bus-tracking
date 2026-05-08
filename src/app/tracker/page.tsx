import { TrackerShell } from "@/components/tracker-shell";
import { getLiveSnapshot } from "@/lib/live-data";

export default function TrackerPage() {
  return <TrackerShell initialSnapshot={getLiveSnapshot()} />;
}

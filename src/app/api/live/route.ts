import { NextResponse } from "next/server";
import { getLiveSnapshot } from "@/lib/live-data";

export function GET() {
  return NextResponse.json(getLiveSnapshot(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "rylee-iep",
    timestamp: new Date().toISOString(),
  });
}

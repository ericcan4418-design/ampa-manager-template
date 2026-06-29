import { NextResponse } from "next/server";
import { getReps } from "../../../lib/ampa";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reps = await getReps();
    return NextResponse.json({ reps }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load reps";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

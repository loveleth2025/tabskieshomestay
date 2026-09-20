import { NextResponse } from "next/server";
import { listReservations } from "@/lib/reservations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { reservations, demo } = await listReservations();
    return NextResponse.json({ reservations, demo });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load reservations." },
      { status: 502 }
    );
  }
}

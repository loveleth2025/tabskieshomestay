import { NextResponse } from "next/server";
import { applyReservationAction, getReservation } from "@/lib/reservations";
import { ReservationAction } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const reservation = await getReservation(params.id);
  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
  }
  return NextResponse.json(reservation);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let action: ReservationAction;
  try {
    const body = await request.json();
    action = body.action;
    if (!action?.type) throw new Error("Missing action type.");
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const updated = await applyReservationAction(params.id, action);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update reservation." },
      { status: 502 }
    );
  }
}

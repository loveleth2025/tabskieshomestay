import { Reservation, ReservationAction } from "./types";
import { addDays } from "./dates";
import { UnitSlug } from "./units";

const today = () => new Date();

// Demo data, dated relative to "today" so the dashboard always looks
// current no matter when you open it. Swap in a real n8n data source by
// setting N8N_RESERVATIONS_WEBHOOK_URL (see README) — until then, this
// in-memory list is what /admin reads and writes.
function seedReservations(): Reservation[] {
  const t = today();
  return [
    {
      id: "r1",
      unitSlug: "lower-unit",
      checkIn: addDays(t, -2),
      checkOut: addDays(t, 0),
      guests: 3,
      fullName: "Ramon Santos",
      email: "ramon.santos@example.com",
      phone: "+63 917 000 1111",
      trustedGuest: false,
      paymentMethod: "gcash",
      bookingRef: "TBK-2026-0151",
      guestId: "G-0231",
      status: "Confirmed",
      paymentStatus: "Paid in Full",
      createdAt: addDays(t, -6),
    },
    {
      id: "r2",
      unitSlug: "whole-house",
      checkIn: addDays(t, 1),
      checkOut: addDays(t, 4),
      guests: 6,
      fullName: "Elena Cruz",
      email: "elena.cruz@example.com",
      phone: "+63 917 000 2222",
      trustedGuest: false,
      paymentMethod: "bank",
      bookingRef: "TBK-2026-0152",
      guestId: "G-0244",
      status: "Confirmed",
      paymentStatus: "Partial (Deposit Paid)",
      createdAt: addDays(t, -4),
    },
    {
      id: "r3",
      unitSlug: "bamboo-unit",
      checkIn: addDays(t, 5),
      checkOut: addDays(t, 8),
      guests: 2,
      fullName: "Mika Reyes",
      email: "mika.reyes@example.com",
      phone: "+63 917 000 3333",
      trustedGuest: true,
      paymentMethod: "cash",
      bookingRef: "TBK-2026-0153",
      guestId: "G-0256",
      status: "Draft",
      paymentStatus: "Unpaid",
      createdAt: addDays(t, -1),
    },
  ];
}

// Module-level store: persists for the life of one warm server instance,
// which is enough to demo the Confirm / Mark Paid / Cancel actions before
// n8n is wired up. It is NOT durable across cold starts or multiple
// serverless regions — see README "Internal dashboard" section.
declare global {
  // eslint-disable-next-line no-var
  var __tabskiesReservations: Reservation[] | undefined;
}

function store(): Reservation[] {
  if (!global.__tabskiesReservations) {
    global.__tabskiesReservations = seedReservations();
  }
  return global.__tabskiesReservations;
}

const READ_WEBHOOK = () => process.env.N8N_RESERVATIONS_WEBHOOK_URL;
const ACTION_WEBHOOK = () => process.env.N8N_RESERVATION_ACTION_WEBHOOK_URL;

export async function listReservations(): Promise<{ reservations: Reservation[]; demo: boolean }> {
  const url = READ_WEBHOOK();
  if (url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load reservations from n8n.");
    const data = await res.json();
    return { reservations: data.reservations ?? data, demo: false };
  }
  return { reservations: store(), demo: true };
}

export async function getReservation(id: string): Promise<Reservation | undefined> {
  const { reservations } = await listReservations();
  return reservations.find((r) => r.id === id);
}

export async function applyReservationAction(
  id: string,
  action: ReservationAction
): Promise<Reservation> {
  const url = ACTION_WEBHOOK();
  if (url) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (!res.ok) throw new Error("n8n rejected this action.");
    return res.json();
  }

  const list = store();
  const index = list.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("Reservation not found.");
  const current = list[index];

  let updated: Reservation = current;
  switch (action.type) {
    case "confirm":
      updated = { ...current, status: "Confirmed" };
      break;
    case "markPaid":
      updated = { ...current, paymentStatus: "Paid in Full" };
      break;
    case "cancelRefund":
      updated = { ...current, paymentStatus: "Refunded" };
      break;
    case "toggleTrusted":
      updated = { ...current, trustedGuest: !current.trustedGuest };
      break;
  }
  list[index] = updated;
  return updated;
}

// Whole House bidirectionally blocks Bamboo Unit and Lower Unit — a rule
// enforced at the workflow level in Tabskies OS (decisions.md), and
// reflected here purely for display: a derived "blocked" bar drawn on the
// other two units' rows for the same date range.
export interface BlockedRange {
  unitSlug: UnitSlug;
  checkIn: string;
  checkOut: string;
  sourceRef: string;
}

export function computeBlockedRanges(reservations: Reservation[]): BlockedRange[] {
  return reservations
    .filter((r) => r.unitSlug === "whole-house" && r.paymentStatus !== "Refunded")
    .flatMap((r): BlockedRange[] => [
      { unitSlug: "bamboo-unit", checkIn: r.checkIn, checkOut: r.checkOut, sourceRef: r.bookingRef },
      { unitSlug: "lower-unit", checkIn: r.checkIn, checkOut: r.checkOut, sourceRef: r.bookingRef },
    ]);
}

import { UnitSlug } from "./units";

// "cash" stays valid for records entered directly by staff (walk-in guests
// paying in person) — it's just no longer offered on the online form, which
// only lets guests choose gcash, bank, or wise (all QR-based).
export type PaymentMethod = "gcash" | "bank" | "wise" | "cash";

// Payment statuses locked in for Tabskies OS (decisions.md):
// Unpaid, Partial (Deposit Paid), Paid in Full, Refunded.
export type PaymentStatus =
  | "Unpaid"
  | "Partial (Deposit Paid)"
  | "Paid in Full"
  | "Refunded";

export interface BookingDraft {
  unitSlug: UnitSlug;
  checkIn: string; // ISO date, e.g. "2026-11-14"
  checkOut: string; // ISO date
  guests: number;
  fullName: string;
  email: string;
  phone: string;
  trustedGuest: boolean;
  paymentMethod: PaymentMethod;
  gcashReference?: string;
  // Set client-side after a successful proof-of-payment upload; the actual
  // file is sent separately as multipart form data (see /api/bookings).
  proofOfPaymentFileName?: string;
}

// What the confirmation / invoice pages read back after submission. The
// booking reference (TBK-YYYY-NNNN) and guest ID (G-NNNN) are generated on
// the backend (n8n + Google Sheets, per decisions.md) — the site never
// invents its own, since sequencing must stay centralized to avoid
// collisions across simultaneous bookings.
export interface BookingResult extends BookingDraft {
  bookingRef: string;
  guestId: string;
  status: "Draft" | "Confirmed";
  paymentStatus: PaymentStatus;
  createdAt: string;
  demo?: boolean; // true when no webhook was configured and this is a mocked result
  // Price snapshot at the moment of booking (includes any extra-guest
  // surcharge already baked in) — optional so older stored records without
  // it still render, falling back to a plain rate × nights calculation.
  subtotal?: number;
  deposit?: number;
  balance?: number;
}

// A reservation as the internal dashboard sees it — the same shape as a
// booking result (so the invoice page can render either one), plus a
// stable `id` used to address it for admin actions (confirm, mark paid,
// cancel/refund, toggle trusted).
export interface Reservation extends BookingResult {
  id: string;
}

export type ReservationAction =
  | { type: "confirm" }
  | { type: "markPaid" }
  | { type: "cancelRefund" }
  | { type: "toggleTrusted" };

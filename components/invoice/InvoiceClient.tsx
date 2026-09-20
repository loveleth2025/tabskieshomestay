"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookingResult } from "@/lib/types";
import { getUnit, Unit } from "@/lib/units";
import { formatPHP, nightsBetween } from "@/lib/pricing";
import { PaymentStatusPill } from "@/components/StatusPill";

const BUSINESS_NAME =
  process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "Tabskie's Homestay and Travel";
const BUSINESS_EMAIL = process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "";
const BUSINESS_PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? "";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  gcash: "GCash",
  bank: "Bank Transfer",
  cash: "Cash",
};

export function InvoiceClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      // Admin flow: look up a reservation by id (this hits the /admin API,
      // so it relies on the browser already having Basic Auth for /admin).
      fetch(`/api/admin/reservations/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setBooking(data);
          setUnit(getUnit(data.unitSlug) ?? null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
      return;
    }

    // Guest flow: the booking wizard stashes its result here right after
    // a successful submission.
    try {
      const b = window.sessionStorage.getItem("tabskies:lastBooking");
      const u = window.sessionStorage.getItem("tabskies:lastUnit");
      if (b) setBooking(JSON.parse(b));
      if (u) setUnit(JSON.parse(u));
    } catch {
      // sessionStorage unavailable — fall through to the empty state below.
    }
  }, [id]);

  if (loading) {
    return <main className="mx-auto max-w-lg px-5 py-16 text-center text-sm text-ink/50">Loading…</main>;
  }

  if (error || !booking || !unit) {
    return (
      <main className="mx-auto max-w-lg px-5 py-16 text-center">
        <p className="text-sm text-ink/60">
          {error ??
            "No recent booking found in this browser. Complete a booking first, then come back here to view its invoice."}
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-teal">
          Back to home
        </Link>
      </main>
    );
  }

  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const baseSubtotal = unit.ratePerNight * nights;
  const subtotal = booking.subtotal ?? baseSubtotal;
  const extraGuestTotal = Math.max(0, subtotal - baseSubtotal);
  const depositPaid =
    booking.deposit ?? (booking.trustedGuest ? 0 : Math.round(subtotal * 0.5));
  const balance = booking.balance ?? subtotal - depositPaid;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <div className="no-print mb-5 flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white"
        >
          Print / Save as PDF
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-white p-8 sm:p-12">
        <div className="flex flex-col justify-between gap-4 border-b-2 border-ink pb-7 sm:flex-row">
          <div>
            <div className="font-display text-2xl font-semibold italic">{BUSINESS_NAME}</div>
            <div className="mt-2 text-xs leading-relaxed text-ink/60">
              Bonbon, Mahinog, Camiguin, Philippines
              {BUSINESS_EMAIL && (
                <>
                  <br />
                  {BUSINESS_EMAIL}
                  {BUSINESS_PHONE ? ` · ${BUSINESS_PHONE}` : ""}
                </>
              )}
            </div>
          </div>
          <div className="sm:text-right">
            <div className="font-display text-2xl font-semibold tracking-wide">INVOICE</div>
            <div className="mt-2 text-xs text-ink/60">No. {booking.bookingRef}</div>
            <div className="text-xs text-ink/60">
              Issued{" "}
              {new Date(booking.createdAt).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-ink/45">
              Billed to
            </div>
            <div className="mt-1.5 text-[15px] font-semibold">{booking.fullName}</div>
            <div className="mt-0.5 text-xs leading-relaxed text-ink/60">
              {booking.email}
              <br />
              {booking.phone}
              <br />
              Guest ID {booking.guestId}
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-ink/45">
              Status
            </div>
            <div className="mt-2">
              <PaymentStatusPill status={booking.paymentStatus} />
            </div>
            <div className="mt-2.5 text-xs text-ink/60">
              {booking.paymentMethod && PAYMENT_METHOD_LABEL[booking.paymentMethod]}
              {booking.paymentMethod !== "cash" ? " · pending verification" : ""}
            </div>
          </div>
        </div>

        <table className="mt-8 w-full border-collapse">
          <thead>
            <tr className="border-b border-ink">
              <th className="pb-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-ink/55">
                Description
              </th>
              <th className="pb-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-ink/55">
                Nights
              </th>
              <th className="pb-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-ink/55">
                Rate
              </th>
              <th className="pb-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-ink/55">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <td className="py-3.5 text-[13.5px]">
                <div className="font-semibold">{unit.name} stay</div>
                <div className="mt-0.5 text-xs text-ink/55">
                  {booking.checkIn} – {booking.checkOut} · {booking.guests} guests
                </div>
              </td>
              <td className="py-3.5 text-right text-[13.5px]">{nights}</td>
              <td className="py-3.5 text-right text-[13.5px]">{formatPHP(unit.ratePerNight)}</td>
              <td className="py-3.5 text-right text-[13.5px] font-semibold">
                {formatPHP(baseSubtotal)}
              </td>
            </tr>
            {extraGuestTotal > 0 && (
              <tr className="border-b border-line">
                <td className="py-3.5 text-[13.5px]">
                  <div className="font-semibold">Extra guest fee</div>
                  <div className="mt-0.5 text-xs text-ink/55">Beyond included guest count</div>
                </td>
                <td className="py-3.5 text-right text-[13.5px]">—</td>
                <td className="py-3.5 text-right text-[13.5px]">—</td>
                <td className="py-3.5 text-right text-[13.5px] font-semibold">
                  {formatPHP(extraGuestTotal)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-2 flex justify-end">
          <div className="flex w-full flex-col gap-2.5 sm:w-72">
            <div className="flex justify-between border-t border-line pt-3.5 text-[13.5px]">
              <span className="text-ink/60">Subtotal</span>
              <span className="font-medium">{formatPHP(subtotal)}</span>
            </div>
            {!booking.trustedGuest && (
              <div className="flex justify-between text-[13.5px] text-teal">
                <span>
                  Deposit paid
                  {booking.paymentMethod ? ` (${PAYMENT_METHOD_LABEL[booking.paymentMethod]})` : ""}
                </span>
                <span className="font-semibold">− {formatPHP(depositPaid)}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-ink pt-2.5 text-[15px] font-bold">
              <span>Balance due on arrival</span>
              <span>{formatPHP(booking.trustedGuest ? subtotal : balance)}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-5">
          <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-ink/45">
            Payment terms
          </div>
          <p className="text-xs leading-relaxed text-ink/60">
            A 50% deposit confirms your reservation; the remaining balance is due on arrival.
            We accept GCash, Bank Transfer, and Cash (for walk-in or trusted guests). Thank you
            for booking direct with {BUSINESS_NAME}.
          </p>
        </div>
      </div>
    </main>
  );
}

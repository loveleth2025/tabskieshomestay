"use client";

import Link from "next/link";
import { Unit } from "@/lib/units";
import { formatPHP, nightsBetween } from "@/lib/pricing";
import { BookingResult } from "@/lib/types";
import { CheckIcon, InfoIcon, InvoiceIcon } from "@/components/Icons";
import { PaymentStatusPill } from "@/components/StatusPill";

export function DoneStep({ unit, result }: { unit: Unit; result: BookingResult }) {
  const nights = nightsBetween(result.checkIn, result.checkOut);
  const subtotal = result.subtotal ?? unit.ratePerNight * nights;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 pb-16 pt-10">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-soft">
        <CheckIcon width={30} height={30} className="text-teal" />
      </div>
      <h1 className="mt-4 text-center font-display text-xl font-semibold sm:text-2xl">
        {result.status === "Confirmed" ? "Booking confirmed" : "Booking request received"}
      </h1>
      <p className="mt-1.5 max-w-sm text-center text-[13px] text-ink/60">
        {result.email
          ? `We've sent your booking details to ${result.email}. `
          : ""}
        Your host will follow up at {result.phone} once payment is verified.
      </p>

      {result.demo && (
        <div className="mt-4 flex gap-2 rounded-xl bg-ochre-soft px-3.5 py-2.5 text-[12px] text-[#7A5322]">
          <InfoIcon width={15} height={15} className="mt-0.5 flex-none" />
          <span>
            Demo mode: no <code>N8N_BOOKING_WEBHOOK_URL</code> is configured yet, so this
            booking reference is a placeholder and nothing was saved. See the README to
            connect it.
          </span>
        </div>
      )}

      <div className="mt-6 w-full rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10.5px] uppercase tracking-wide text-ink/50">
              Booking reference
            </div>
            <div className="mt-0.5 font-display text-lg font-semibold">
              {result.bookingRef}
            </div>
          </div>
          <PaymentStatusPill status={result.paymentStatus} />
        </div>

        <div className="my-4 h-px bg-line" />

        <div className="flex flex-col gap-2.5 text-[13px]">
          <Row label="Unit" value={unit.name} />
          <Row label="Dates" value={`${result.checkIn} → ${result.checkOut}`} />
          <Row label="Guests" value={String(result.guests)} />
          <Row label="Total" value={formatPHP(subtotal)} />
        </div>

        <div className="mt-4 h-px bg-line" />

        <Link
          href="/invoice"
          className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-teal"
        >
          <InvoiceIcon width={14} height={14} />
          View invoice
        </Link>
      </div>

      <Link
        href="/"
        className="mt-6 block w-full rounded-xl border border-ink/15 py-3.5 text-center text-[14px] font-semibold"
      >
        Back to home
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink/55">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

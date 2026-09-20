"use client";

import type { ReactNode } from "react";
import { Unit } from "@/lib/units";
import { computePrice, nightsBetween } from "@/lib/pricing";
import { PaymentMethod } from "@/lib/types";
import { ChevronLeftIcon, GcashIcon, BankIcon } from "@/components/Icons";
import { PriceSummary } from "./PriceSummary";

interface DetailsPatch {
  fullName?: string;
  email?: string;
  phone?: string;
  paymentMethod?: PaymentMethod;
}

export function DetailsStep({
  unit,
  checkIn,
  checkOut,
  guests,
  fullName,
  email,
  phone,
  paymentMethod,
  onChange,
  onBack,
  onContinue,
}: {
  unit: Unit;
  checkIn: string;
  checkOut: string;
  guests: number;
  fullName: string;
  email: string;
  phone: string;
  paymentMethod: PaymentMethod;
  onChange: (patch: DetailsPatch) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const nights = nightsBetween(checkIn, checkOut);
  // Deposit is always required online now — there's no more Trusted Guest
  // waiver on the guest-facing form (staff can still flag a reservation
  // Trusted from /admin afterward, for their own records; it just doesn't
  // change the price here).
  const price = computePrice(unit, nights, guests, false);
  const emailValid = email.trim().length === 0 || email.includes("@");
  const canContinue = fullName.trim().length > 1 && emailValid && phone.trim().length > 4;

  return (
    <div className="mx-auto max-w-lg px-5 pb-28 pt-5 sm:px-0">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface"
        >
          <ChevronLeftIcon width={15} height={15} />
        </button>
        <div>
          <div className="text-[15px] font-semibold">Guest details</div>
          <div className="text-[11.5px] text-ink/55">
            {unit.name} · {nights} night{nights === 1 ? "" : "s"} · {guests} guests
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <label className="block">
          <span className="mb-1 block text-[11.5px] font-semibold text-ink/65">Full name</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="Juana Dela Cruz"
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[13.5px]"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11.5px] font-semibold text-ink/65">
            Email <span className="font-normal text-ink/40">(optional)</span>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="juana@email.com"
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[13.5px]"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11.5px] font-semibold text-ink/65">Phone</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+63 9XX XXX XXXX"
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[13.5px]"
          />
        </label>
      </div>

      <h2 className="mb-2.5 mt-6 font-display text-base font-semibold">How will you pay?</h2>
      <div className="flex flex-col gap-2.5">
        <PaymentOption
          id="pay-gcash"
          icon={<GcashIcon width={19} height={19} className="text-teal" />}
          label="GCash"
          helper="Scan the QR code, instant confirmation"
          checked={paymentMethod === "gcash"}
          onSelect={() => onChange({ paymentMethod: "gcash" })}
        />
        <PaymentOption
          id="pay-bank"
          icon={<BankIcon width={19} height={19} className="text-teal" />}
          label="Bank Transfer"
          helper="Scan the QR code — confirmed once we receive proof of payment"
          checked={paymentMethod === "bank"}
          onSelect={() => onChange({ paymentMethod: "bank" })}
        />
        <PaymentOption
          id="pay-wise"
          icon={<BankIcon width={19} height={19} className="text-teal" />}
          label="Wise Transfer"
          helper="For international guests — confirmed once we receive proof of payment"
          checked={paymentMethod === "wise"}
          onSelect={() => onChange({ paymentMethod: "wise" })}
        />
      </div>

      <div className="mt-5">
        <PriceSummary
          nights={price.nights}
          ratePerNight={price.ratePerNight}
          extraGuests={price.extraGuests}
          extraGuestFeePerNight={price.extraGuestFeePerNight}
          extraGuestTotal={price.extraGuestTotal}
          subtotal={price.subtotal}
          deposit={price.deposit}
          balance={price.balance}
          trustedGuest={false}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface p-3.5 sm:sticky sm:mt-6 sm:rounded-t-2xl sm:border-x sm:p-4">
        <button
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className="block w-full rounded-xl bg-teal py-3.5 text-center text-[14.5px] font-semibold text-white disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function PaymentOption({
  id,
  icon,
  label,
  helper,
  checked,
  onSelect,
}: {
  id: string;
  icon: ReactNode;
  label: string;
  helper: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-surface p-3.5"
    >
      <input
        id={id}
        type="radio"
        name="payment"
        checked={checked}
        onChange={onSelect}
        className="h-4 w-4 flex-none accent-teal"
      />
      {icon}
      <span className="flex-1">
        <span className="block text-[13px] font-semibold">{label}</span>
        <span className="block text-[11.5px] text-ink/55">{helper}</span>
      </span>
    </label>
  );
}

"use client";

import Link from "next/link";
import { Unit, suggestsWholeHouse, MAX_STEPPER_GUESTS } from "@/lib/units";
import { computePrice, nightsBetween } from "@/lib/pricing";
import { AlertIcon, ChevronLeftIcon } from "@/components/Icons";
import { GuestStepper } from "./GuestStepper";
import { PriceSummary } from "./PriceSummary";

export function DatesStep({
  unit,
  checkIn,
  checkOut,
  guests,
  onChange,
  onContinue,
}: {
  unit: Unit;
  checkIn: string;
  checkOut: string;
  guests: number;
  onChange: (patch: Partial<{ checkIn: string; checkOut: string; guests: number }>) => void;
  onContinue: () => void;
}) {
  const nights = nightsBetween(checkIn, checkOut);
  const price = computePrice(unit, nights, guests, false);
  const overCapacity = suggestsWholeHouse(unit, guests);
  const canContinue = nights > 0 && guests >= 1;

  return (
    <div className="mx-auto max-w-lg px-5 pb-28 pt-5 sm:px-0">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={`/units/${unit.slug}`}
          aria-label="Back"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface"
        >
          <ChevronLeftIcon width={15} height={15} />
        </Link>
        <div>
          <div className="text-[15px] font-semibold">{unit.name}</div>
          <div className="text-[11.5px] text-ink/55">Dates &amp; guests</div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/50">
              Check-in
            </span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => onChange({ checkIn: e.target.value })}
              className="w-full rounded-lg border border-ink/15 bg-white px-2.5 py-2 text-[13.5px]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink/50">
              Check-out
            </span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => onChange({ checkOut: e.target.value })}
              className="w-full rounded-lg border border-ink/15 bg-white px-2.5 py-2 text-[13.5px]"
            />
          </label>
        </div>
        {checkIn && checkOut && nights <= 0 && (
          <p className="mt-2 text-xs text-clay">Check-out must be after check-in.</p>
        )}
      </div>

      <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-line bg-surface p-4">
        <div>
          <div className="text-[14.5px] font-semibold">Guests</div>
          <div className="mt-0.5 text-[11.5px] text-ink/50">
            {unit.extraGuestFee
              ? `${unit.baseGuests} included, up to ${unit.maxGuests} with extra guest fee`
              : `Max ${unit.maxGuests} for ${unit.name}`}
          </div>
        </div>
        <GuestStepper
          value={guests}
          onChange={(next) => onChange({ guests: next })}
          max={MAX_STEPPER_GUESTS}
        />
      </div>

      {overCapacity && (
        <div className="mt-3 flex gap-2.5 rounded-2xl border border-[#EFCB98] bg-ochre-soft p-3.5">
          <AlertIcon width={17} height={17} className="mt-0.5 flex-none text-ochre" />
          <p className="text-[12.5px] leading-relaxed text-[#7A5322]">
            {guests} guests is over {unit.name}&apos;s limit of {unit.maxGuests}. Consider{" "}
            <Link href="/units/whole-house" className="font-semibold text-ochre">
              Whole House
            </Link>{" "}
            instead.
          </p>
        </div>
      )}

      {nights > 0 && (
        <div className="mt-6">
          <h2 className="mb-2.5 font-display text-base font-semibold">Price details</h2>
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
      )}

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

// Payment model locked in for Tabskies OS: 50% deposit, 50% on arrival —
// unless the guest is flagged Trusted, in which case the deposit is optional.
export const DEPOSIT_RATE = 0.5;

export function nightsBetween(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const ms = outDate.getTime() - inDate.getTime();
  const nights = Math.round(ms / (1000 * 60 * 60 * 24));
  return Number.isFinite(nights) && nights > 0 ? nights : 0;
}

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface PriceBreakdown {
  nights: number;
  ratePerNight: number;
  baseSubtotal: number;
  // Guests beyond the unit's baseGuests, and the per-person/per-night fee
  // charged for them (0 for units with no extraGuestFee configured).
  extraGuests: number;
  extraGuestFeePerNight: number;
  extraGuestTotal: number;
  subtotal: number;
  deposit: number;
  balance: number;
}

interface PriceableUnit {
  ratePerNight: number;
  baseGuests?: number;
  extraGuestFee?: number;
}

export function computePrice(
  unit: PriceableUnit,
  nights: number,
  guests: number,
  trustedGuest: boolean
): PriceBreakdown {
  const baseSubtotal = unit.ratePerNight * nights;

  const extraGuests =
    unit.extraGuestFee && unit.baseGuests && guests > unit.baseGuests
      ? guests - unit.baseGuests
      : 0;
  const extraGuestFeePerNight = extraGuests > 0 ? unit.extraGuestFee ?? 0 : 0;
  const extraGuestTotal = extraGuests * extraGuestFeePerNight * nights;

  const subtotal = baseSubtotal + extraGuestTotal;
  const deposit = trustedGuest ? 0 : Math.round(subtotal * DEPOSIT_RATE);
  const balance = subtotal - deposit;

  return {
    nights,
    ratePerNight: unit.ratePerNight,
    baseSubtotal,
    extraGuests,
    extraGuestFeePerNight,
    extraGuestTotal,
    subtotal,
    deposit,
    balance,
  };
}

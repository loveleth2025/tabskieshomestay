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
  subtotal: number;
  deposit: number;
  balance: number;
}

export function computePrice(
  ratePerNight: number,
  nights: number,
  trustedGuest: boolean
): PriceBreakdown {
  const subtotal = ratePerNight * nights;
  const deposit = trustedGuest ? 0 : Math.round(subtotal * DEPOSIT_RATE);
  const balance = subtotal - deposit;
  return { nights, ratePerNight, subtotal, deposit, balance };
}

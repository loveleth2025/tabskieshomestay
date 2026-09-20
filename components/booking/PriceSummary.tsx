import { formatPHP } from "@/lib/pricing";

export function PriceSummary({
  nights,
  ratePerNight,
  extraGuests = 0,
  extraGuestFeePerNight = 0,
  extraGuestTotal = 0,
  subtotal,
  deposit,
  balance,
  trustedGuest,
}: {
  nights: number;
  ratePerNight: number;
  extraGuests?: number;
  extraGuestFeePerNight?: number;
  extraGuestTotal?: number;
  subtotal: number;
  deposit: number;
  balance: number;
  trustedGuest: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-4">
      <div className="flex justify-between text-[13.5px] text-ink/65">
        <span>
          {formatPHP(ratePerNight)} × {nights} night{nights === 1 ? "" : "s"}
        </span>
        <span>{formatPHP(ratePerNight * nights)}</span>
      </div>
      {extraGuests > 0 && (
        <div className="flex justify-between text-[13.5px] text-ink/65">
          <span>
            +{extraGuests} extra guest{extraGuests === 1 ? "" : "s"} ×{" "}
            {formatPHP(extraGuestFeePerNight)} × {nights} night{nights === 1 ? "" : "s"}
          </span>
          <span>{formatPHP(extraGuestTotal)}</span>
        </div>
      )}
      <div className="h-px bg-line" />
      <div className="flex justify-between text-[13.5px] font-semibold">
        <span>Total</span>
        <span>{formatPHP(subtotal)}</span>
      </div>
      {trustedGuest ? (
        <>
          <div className="flex justify-between text-[13.5px] font-semibold text-teal">
            <span>Deposit</span>
            <span>Not required</span>
          </div>
          <div className="flex justify-between text-xs text-ink/50">
            <span>Due on arrival</span>
            <span>{formatPHP(subtotal)}</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between text-[13.5px] font-semibold text-teal">
            <span>Due now (50% deposit)</span>
            <span>{formatPHP(deposit)}</span>
          </div>
          <div className="flex justify-between text-xs text-ink/50">
            <span>Due on arrival</span>
            <span>{formatPHP(balance)}</span>
          </div>
        </>
      )}
    </div>
  );
}

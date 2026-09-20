"use client";

import { useRef } from "react";
import { PaymentMethod } from "@/lib/types";
import { formatPHP } from "@/lib/pricing";
import { ChevronLeftIcon, UploadIcon, InfoIcon } from "@/components/Icons";

export function PayStep({
  paymentMethod,
  amountDueNow,
  gcashReference,
  onGcashReferenceChange,
  proofFile,
  onProofFileChange,
  onBack,
  onSubmit,
  submitting,
  error,
}: {
  paymentMethod: PaymentMethod;
  amountDueNow: number;
  gcashReference: string;
  onGcashReferenceChange: (value: string) => void;
  proofFile: File | null;
  onProofFileChange: (file: File | null) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    !submitting &&
    (paymentMethod === "cash" ||
      (paymentMethod === "gcash" && gcashReference.trim().length > 3) ||
      (paymentMethod === "bank" && !!proofFile));

  const ctaLabel =
    paymentMethod === "gcash"
      ? "I've sent the payment"
      : paymentMethod === "bank"
      ? "Submit for verification"
      : "Confirm booking";

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
        <div className="text-[15px] font-semibold">Where to pay</div>
      </div>

      {paymentMethod === "gcash" && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl border border-dashed border-ink/25 bg-sandDark text-[11px] text-ink/45">
            [ GCash QR code ]
          </div>
          <p className="mt-2.5 text-center text-[11.5px] text-ink/55">
            Scan in the GCash app
          </p>

          <div className="my-4 h-px bg-line" />

          <div className="flex flex-col gap-3">
            <Field label="GCash number" value="0917 123 4567" />
            <Field label="Account name" value="Tabskie's Homestay and Travel" />
            <div className="flex items-center justify-between rounded-lg bg-teal-soft px-3 py-2.5">
              <span className="text-[12.5px] text-ink/65">Amount due now</span>
              <span className="text-[15px] font-bold text-teal">
                {formatPHP(amountDueNow)}
              </span>
            </div>
          </div>

          <label className="mt-4 block">
            <span className="mb-1 block text-[11.5px] font-semibold text-ink/65">
              GCash reference number
            </span>
            <input
              type="text"
              value={gcashReference}
              onChange={(e) => onGcashReferenceChange(e.target.value)}
              placeholder="e.g. 1123 456 789012"
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[13.5px]"
            />
          </label>
        </div>
      )}

      {paymentMethod === "bank" && (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
            <Field label="Bank" value="BDO Unibank" />
            <Field label="Account name" value="Tabskie's Homestay and Travel" />
            <Field label="Account number" value="0012 3456 7890" />
            <div className="flex items-center justify-between rounded-lg bg-teal-soft px-3 py-2.5">
              <span className="text-[12.5px] text-ink/65">Amount due now</span>
              <span className="text-[15px] font-bold text-teal">
                {formatPHP(amountDueNow)}
              </span>
            </div>
          </div>

          <label
            htmlFor="proof"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-ink/25 p-6 text-center"
          >
            <UploadIcon width={22} height={22} className="text-teal" />
            <span className="text-[12.5px] font-semibold">
              {proofFile ? proofFile.name : "Upload proof of payment"}
            </span>
            <span className="text-[11px] text-ink/50">
              Screenshot or photo of your receipt
            </span>
            <input
              ref={fileInputRef}
              id="proof"
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => onProofFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      )}

      {paymentMethod === "cash" && (
        <div className="flex flex-col gap-3.5">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex gap-2.5">
              <InfoIcon width={20} height={20} className="mt-0.5 flex-none text-teal" />
              <div>
                <div className="text-[14.5px] font-semibold">Pay in cash on arrival</div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/65">
                  As a trusted guest, no deposit is needed online. Please prepare the
                  full amount to hand to your host at check-in.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-teal-soft px-3 py-2.5">
              <span className="text-[12.5px] text-ink/65">Amount due on arrival</span>
              <span className="text-[15px] font-bold text-teal">
                {formatPHP(amountDueNow)}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-clay-soft px-3.5 py-2.5 text-[12.5px] text-clay">
          {error}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface p-3.5 sm:sticky sm:mt-6 sm:rounded-t-2xl sm:border-x sm:p-4">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className="block w-full rounded-xl bg-teal py-3.5 text-center text-[14.5px] font-semibold text-white disabled:opacity-40"
        >
          {submitting ? "Submitting…" : ctaLabel}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">
        {label}
      </div>
      <div className="mt-0.5 text-[14px] font-semibold">{value}</div>
    </div>
  );
}

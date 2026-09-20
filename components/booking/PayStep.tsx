"use client";

import { useRef } from "react";
import { PaymentMethod } from "@/lib/types";
import { formatPHP } from "@/lib/pricing";
import { ChevronLeftIcon, UploadIcon } from "@/components/Icons";

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
    ((paymentMethod === "gcash" && gcashReference.trim().length > 3) ||
      ((paymentMethod === "bank" || paymentMethod === "wise") && !!proofFile));

  const ctaLabel = paymentMethod === "gcash" ? "I've sent the payment" : "Submit for verification";

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
          <QrBox src="/payment/gcash-qr.jpg" alt="GCash QR code" fileName="gcash-qr.jpg" />
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
          <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-5">
            <QrBox src="/payment/bank-qr.jpeg" alt="Bank transfer QR code" fileName="bank-qr.jpeg" />
            <p className="text-center text-[11.5px] text-ink/55">
              Scan with your banking app (InstaPay/PesoNet QR)
            </p>
            <div className="h-px bg-line" />
            <Field label="Bank" value="Philippine National Bank (PNB)" />
            <Field label="Account name" value="Tabskie's Homestay and Travel" />
            <div className="flex items-center justify-between rounded-lg bg-teal-soft px-3 py-2.5">
              <span className="text-[12.5px] text-ink/65">Amount due now</span>
              <span className="text-[15px] font-bold text-teal">
                {formatPHP(amountDueNow)}
              </span>
            </div>
          </div>

          <ProofUpload
            fileInputRef={fileInputRef}
            proofFile={proofFile}
            onProofFileChange={onProofFileChange}
          />
        </div>
      )}

      {paymentMethod === "wise" && (
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-5">
            <QrBox src="/payment/wise-qr.jpeg" alt="Wise transfer QR code" fileName="wise-qr.jpeg" />
            <p className="text-center text-[11.5px] text-ink/55">
              For international guests — scan or send to the details below in your
              Wise app
            </p>
            <div className="h-px bg-line" />
            <Field label="Wise account name" value="Tabskie's Homestay and Travel" />
            <Field label="Wise email" value="loveraagas2017@gmail.com" />
            <div className="flex items-center justify-between rounded-lg bg-teal-soft px-3 py-2.5">
              <span className="text-[12.5px] text-ink/65">Amount due now</span>
              <span className="text-[15px] font-bold text-teal">
                {formatPHP(amountDueNow)}
              </span>
            </div>
          </div>

          <ProofUpload
            fileInputRef={fileInputRef}
            proofFile={proofFile}
            onProofFileChange={onProofFileChange}
          />
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

function QrBox({ src, alt, fileName }: { src: string; alt: string; fileName: string }) {
  return (
    <div className="relative mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-ink/25 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-contain"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <span className="relative px-3 text-center text-[11px] text-ink/45">
        [ add {fileName} to /public/payment ]
      </span>
    </div>
  );
}

function ProofUpload({
  fileInputRef,
  proofFile,
  onProofFileChange,
}: {
  fileInputRef: React.RefObject<HTMLInputElement>;
  proofFile: File | null;
  onProofFileChange: (file: File | null) => void;
}) {
  return (
    <label
      htmlFor="proof"
      className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-ink/25 p-6 text-center"
    >
      <UploadIcon width={22} height={22} className="text-teal" />
      <span className="text-[12.5px] font-semibold">
        {proofFile ? proofFile.name : "Upload proof of payment"}
      </span>
      <span className="text-[11px] text-ink/50">Screenshot or photo of your receipt</span>
      <input
        ref={fileInputRef}
        id="proof"
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => onProofFileChange(e.target.files?.[0] ?? null)}
      />
    </label>
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

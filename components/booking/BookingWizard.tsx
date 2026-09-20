"use client";

import { useState } from "react";
import { Unit } from "@/lib/units";
import { PaymentMethod, BookingResult } from "@/lib/types";
import { DatesStep } from "./DatesStep";
import { DetailsStep } from "./DetailsStep";
import { PayStep } from "./PayStep";
import { DoneStep } from "./DoneStep";
import { computePrice, nightsBetween } from "@/lib/pricing";

type Step = "dates" | "details" | "pay" | "done";

export function BookingWizard({ unit }: { unit: Unit }) {
  const [step, setStep] = useState<Step>("dates");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [trustedGuest, setTrustedGuest] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("gcash");

  const [gcashReference, setGcashReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  const nights = nightsBetween(checkIn, checkOut);
  const price = computePrice(unit.ratePerNight, nights, trustedGuest);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const form = new FormData();
      form.set("unitSlug", unit.slug);
      form.set("unitName", unit.name);
      form.set("checkIn", checkIn);
      form.set("checkOut", checkOut);
      form.set("guests", String(guests));
      form.set("fullName", fullName);
      form.set("email", email);
      form.set("phone", phone);
      form.set("trustedGuest", String(trustedGuest));
      form.set("paymentMethod", paymentMethod);
      form.set("gcashReference", gcashReference);
      form.set("ratePerNight", String(unit.ratePerNight));
      form.set("subtotal", String(price.subtotal));
      form.set("deposit", String(price.deposit));
      form.set("balance", String(price.balance));
      if (proofFile) form.set("proofOfPayment", proofFile);

      const res = await fetch("/api/bookings", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong submitting your booking.");
      }
      const data: BookingResult = await res.json();
      setResult(data);

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("tabskies:lastBooking", JSON.stringify(data));
        window.sessionStorage.setItem("tabskies:lastUnit", JSON.stringify(unit));
      }

      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done" && result) {
    return <DoneStep unit={unit} result={result} />;
  }

  if (step === "pay") {
    const amountDueNow = trustedGuest ? price.subtotal : price.deposit;
    return (
      <PayStep
        paymentMethod={paymentMethod}
        amountDueNow={amountDueNow}
        gcashReference={gcashReference}
        onGcashReferenceChange={setGcashReference}
        proofFile={proofFile}
        onProofFileChange={setProofFile}
        onBack={() => setStep("details")}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      />
    );
  }

  if (step === "details") {
    return (
      <DetailsStep
        unit={unit}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        fullName={fullName}
        email={email}
        phone={phone}
        trustedGuest={trustedGuest}
        paymentMethod={paymentMethod}
        onChange={(patch) => {
          if (patch.fullName !== undefined) setFullName(patch.fullName);
          if (patch.email !== undefined) setEmail(patch.email);
          if (patch.phone !== undefined) setPhone(patch.phone);
          if (patch.trustedGuest !== undefined) setTrustedGuest(patch.trustedGuest);
          if (patch.paymentMethod !== undefined) setPaymentMethod(patch.paymentMethod);
        }}
        onBack={() => setStep("dates")}
        onContinue={() => setStep("pay")}
      />
    );
  }

  return (
    <DatesStep
      unit={unit}
      checkIn={checkIn}
      checkOut={checkOut}
      guests={guests}
      onChange={(patch) => {
        if (patch.checkIn !== undefined) setCheckIn(patch.checkIn);
        if (patch.checkOut !== undefined) setCheckOut(patch.checkOut);
        if (patch.guests !== undefined) setGuests(patch.guests);
      }}
      onContinue={() => setStep("details")}
    />
  );
}

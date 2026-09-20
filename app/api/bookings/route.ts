import { NextResponse } from "next/server";
import { BookingResult, PaymentMethod, PaymentStatus } from "@/lib/types";

export const runtime = "nodejs";

function readFields(form: FormData) {
  const str = (key: string) => String(form.get(key) ?? "").trim();
  return {
    unitSlug: str("unitSlug"),
    unitName: str("unitName"),
    checkIn: str("checkIn"),
    checkOut: str("checkOut"),
    guests: Number(str("guests") || "0"),
    fullName: str("fullName"),
    email: str("email"),
    phone: str("phone"),
    trustedGuest: str("trustedGuest") === "true",
    paymentMethod: str("paymentMethod") as PaymentMethod,
    gcashReference: str("gcashReference"),
    ratePerNight: Number(str("ratePerNight") || "0"),
    subtotal: Number(str("subtotal") || "0"),
    deposit: Number(str("deposit") || "0"),
    balance: Number(str("balance") || "0"),
  };
}

function validate(fields: ReturnType<typeof readFields>): string | null {
  if (!fields.unitSlug) return "Missing unit.";
  if (!fields.checkIn || !fields.checkOut) return "Missing dates.";
  if (!fields.guests || fields.guests < 1) return "Guest count must be at least 1.";
  if (!fields.fullName) return "Full name is required.";
  if (!fields.email.includes("@")) return "A valid email is required.";
  if (!fields.phone) return "Phone number is required.";
  if (fields.paymentMethod === "gcash" && fields.gcashReference.length < 4) {
    return "Enter your GCash reference number.";
  }
  return null;
}

// Used only when N8N_BOOKING_WEBHOOK_URL is not configured, so the flow can
// still be demoed end-to-end. The real booking reference (TBK-YYYY-NNNN) and
// guest ID (G-NNNN) must come from the backend, since sequencing has to be
// centralized (see decisions.md: "Concurrency control ... is critical for
// preventing race conditions in sequential ID generation").
function buildDemoResult(fields: ReturnType<typeof readFields>): BookingResult {
  const year = new Date().getFullYear();
  const randomSeq = String(Math.floor(1000 + Math.random() * 9000));
  const paymentStatus: PaymentStatus = fields.trustedGuest
    ? "Unpaid"
    : "Partial (Deposit Paid)";

  return {
    unitSlug: fields.unitSlug as BookingResult["unitSlug"],
    checkIn: fields.checkIn,
    checkOut: fields.checkOut,
    guests: fields.guests,
    fullName: fields.fullName,
    email: fields.email,
    phone: fields.phone,
    trustedGuest: fields.trustedGuest,
    paymentMethod: fields.paymentMethod,
    gcashReference: fields.gcashReference || undefined,
    bookingRef: `TBK-${year}-${randomSeq}`,
    guestId: `G-${randomSeq}`,
    status: "Draft",
    paymentStatus,
    createdAt: new Date().toISOString(),
    subtotal: fields.subtotal,
    deposit: fields.deposit,
    balance: fields.balance,
    demo: true,
  };
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not read the submitted form." }, { status: 400 });
  }

  const fields = readFields(form);
  const validationError = validate(fields);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 422 });
  }
  if (fields.paymentMethod === "cash" && !fields.trustedGuest) {
    return NextResponse.json(
      { error: "Cash is only available for walk-in or trusted guests." },
      { status: 422 }
    );
  }
  if (fields.paymentMethod === "bank" && !(form.get("proofOfPayment") instanceof File)) {
    return NextResponse.json(
      { error: "Please upload proof of payment for bank transfer." },
      { status: 422 }
    );
  }

  const webhookUrl = process.env.N8N_BOOKING_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(buildDemoResult(fields));
  }

  // Forward the full submission — including the uploaded proof-of-payment
  // file, if any — to the n8n Webhook node. See README.md for the exact
  // contract n8n is expected to receive and return.
  const forward = new FormData();
  for (const [key, value] of form.entries()) {
    forward.append(key, value as string | Blob);
  }

  let webhookResponse: Response;
  try {
    webhookResponse = await fetch(webhookUrl, { method: "POST", body: forward });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the booking service. Please try again shortly." },
      { status: 502 }
    );
  }

  if (!webhookResponse.ok) {
    return NextResponse.json(
      { error: "The booking service could not process this request." },
      { status: 502 }
    );
  }

  let data: Partial<BookingResult> | null = null;
  try {
    data = await webhookResponse.json();
  } catch {
    data = null;
  }

  if (!data || !data.bookingRef || !data.guestId) {
    return NextResponse.json(
      {
        error:
          "The booking service returned an unexpected response. Check the n8n workflow's Respond to Webhook node.",
      },
      { status: 502 }
    );
  }

  const result: BookingResult = {
    unitSlug: fields.unitSlug as BookingResult["unitSlug"],
    checkIn: fields.checkIn,
    checkOut: fields.checkOut,
    guests: fields.guests,
    fullName: fields.fullName,
    email: fields.email,
    phone: fields.phone,
    trustedGuest: fields.trustedGuest,
    paymentMethod: fields.paymentMethod,
    gcashReference: fields.gcashReference || undefined,
    bookingRef: data.bookingRef,
    guestId: data.guestId,
    status: data.status ?? "Draft",
    paymentStatus: data.paymentStatus ?? "Unpaid",
    createdAt: data.createdAt ?? new Date().toISOString(),
    subtotal: data.subtotal ?? fields.subtotal,
    deposit: data.deposit ?? fields.deposit,
    balance: data.balance ?? fields.balance,
  };

  return NextResponse.json(result);
}

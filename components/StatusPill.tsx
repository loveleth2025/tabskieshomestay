import { PaymentStatus } from "@/lib/types";

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  Unpaid: "bg-black/5 text-ink/55",
  "Partial (Deposit Paid)": "bg-ochre-soft text-ochre",
  "Paid in Full": "bg-teal-soft text-teal",
  Refunded: "bg-clay-soft text-clay",
};

export function PaymentStatusPill({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${PAYMENT_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export function ReservationStatusPill({ status }: { status: "Draft" | "Confirmed" }) {
  const style =
    status === "Draft" ? "bg-ochre-soft text-ochre" : "bg-teal-soft text-teal";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${style}`}
    >
      {status}
    </span>
  );
}

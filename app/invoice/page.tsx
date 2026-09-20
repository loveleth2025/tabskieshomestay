import { Suspense } from "react";
import { InvoiceClient } from "@/components/invoice/InvoiceClient";

export default function InvoicePage() {
  return (
    <Suspense
      fallback={<main className="mx-auto max-w-lg px-5 py-16 text-center text-sm text-ink/50">Loading…</main>}
    >
      <InvoiceClient />
    </Suspense>
  );
}

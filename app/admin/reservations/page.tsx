import { Suspense } from "react";
import { ReservationsClient } from "@/components/admin/ReservationsClient";

export default function ReservationsPage() {
  return (
    <Suspense fallback={<main className="p-7 text-sm text-ink/50">Loading…</main>}>
      <ReservationsClient />
    </Suspense>
  );
}

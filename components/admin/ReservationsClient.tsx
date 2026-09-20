"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Reservation, ReservationAction } from "@/lib/types";
import { UNITS } from "@/lib/units";
import { formatDateRange } from "@/lib/dates";
import { PaymentStatusPill, ReservationStatusPill } from "@/components/StatusPill";
import { InvoiceIcon, SearchIcon } from "@/components/Icons";

type Filter = "all" | "draft" | "confirmed";

export function ReservationsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("id"));
  const [actionPending, setActionPending] = useState(false);

  useEffect(() => {
    fetch("/api/admin/reservations")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setReservations(data.reservations);
        setDemo(data.demo);
        setSelectedId((current) => current ?? data.reservations[0]?.id ?? null);
      })
      .catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    if (!reservations) return [];
    return reservations.filter((r) => {
      if (filter !== "all" && r.status.toLowerCase() !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return r.fullName.toLowerCase().includes(q) || r.bookingRef.toLowerCase().includes(q);
      }
      return true;
    });
  }, [reservations, filter, query]);

  const selected = reservations?.find((r) => r.id === selectedId) ?? null;

  function select(id: string) {
    setSelectedId(id);
    router.replace(`/admin/reservations?id=${id}`, { scroll: false });
  }

  async function runAction(action: ReservationAction) {
    if (!selected) return;
    setActionPending(true);
    try {
      const res = await fetch(`/api/admin/reservations/${selected.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error ?? "Could not update reservation.");
      setReservations((prev) => prev?.map((r) => (r.id === updated.id ? updated : r)) ?? prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setActionPending(false);
    }
  }

  return (
    <main className="flex" style={{ minHeight: "calc(100vh - 68px)" }}>
      <div className="flex w-[420px] flex-none flex-col border-r border-line bg-[#FBF8F2]">
        <div className="flex-none p-5 pb-3">
          <h1 className="mb-3 font-display text-lg font-semibold">Reservations</h1>
          <div className="flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-2">
            <SearchIcon width={14} height={14} className="text-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guest or booking ref"
              className="flex-1 bg-transparent text-xs outline-none"
            />
          </div>
          <div className="mt-3 flex gap-2">
            {(["all", "draft", "confirmed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ${
                  filter === f ? "bg-teal text-white" : "border border-line bg-white text-ink/60"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {demo && (
            <p className="mt-3 text-xs text-ochre">
              Demo data — connect N8N_RESERVATIONS_WEBHOOK_URL for real records.
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {!reservations && !error && <p className="p-5 text-sm text-ink/50">Loading…</p>}
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => select(r.id)}
              className={`block w-full border-b border-black/5 p-3.5 text-left ${
                r.id === selectedId ? "bg-teal-soft" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] font-semibold">{r.fullName}</span>
                <ReservationStatusPill status={r.status} />
              </div>
              <div className="mt-1 text-xs text-ink/55">
                {UNITS[r.unitSlug].name} · {formatDateRange(r.checkIn, r.checkOut)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-ink/45">{r.bookingRef}</span>
                <PaymentStatusPill status={r.paymentStatus} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10">
        {error && <p className="text-sm text-clay">{error}</p>}
        {selected && (
          <div className="max-w-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">
                  {selected.bookingRef} · {selected.guestId}
                </div>
                <h2 className="mt-1.5 font-display text-2xl font-semibold">{selected.fullName}</h2>
              </div>
              <div className="flex gap-2">
                <ReservationStatusPill status={selected.status} />
                <PaymentStatusPill status={selected.paymentStatus} />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3.5">
              <Field label="Unit" value={UNITS[selected.unitSlug].name} />
              <Field label="Dates" value={formatDateRange(selected.checkIn, selected.checkOut)} />
              <Field label="Guests" value={String(selected.guests)} />
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-white p-5">
              <div className="mb-3.5 text-[11px] font-bold uppercase tracking-wide text-ink/45">
                Payment
              </div>
              <div className="flex flex-col gap-2.5 text-[13.5px]">
                <Row label="Method" value={selected.paymentMethod ?? "—"} />
                <Row label="Email" value={selected.email} />
                <Row label="Phone" value={selected.phone} />
              </div>

              <div className="my-4 h-px bg-line" />

              <label className="flex cursor-pointer items-center justify-between">
                <span>
                  <span className="block text-[13px] font-semibold">Trusted guest</span>
                  <span className="mt-0.5 block text-[11.5px] text-ink/50">
                    Waives the deposit requirement
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={selected.trustedGuest}
                  disabled={actionPending}
                  onChange={() => runAction({ type: "toggleTrusted" })}
                  className="h-[17px] w-[17px] accent-teal"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {selected.status === "Draft" && (
                <ActionButton primary onClick={() => runAction({ type: "confirm" })} disabled={actionPending}>
                  Confirm reservation
                </ActionButton>
              )}
              {selected.paymentStatus !== "Paid in Full" && selected.paymentStatus !== "Refunded" && (
                <ActionButton onClick={() => runAction({ type: "markPaid" })} disabled={actionPending}>
                  Mark paid in full
                </ActionButton>
              )}
              <ActionButton tone="clay" onClick={() => runAction({ type: "cancelRefund" })} disabled={actionPending}>
                Cancel &amp; refund
              </ActionButton>
              <Link
                href={`/invoice?id=${selected.id}`}
                className="flex items-center gap-1.5 rounded-lg border border-line px-[18px] py-3 text-[13.5px] font-semibold"
              >
                <InvoiceIcon width={14} height={14} />
                View invoice
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3.5">
      <div className="text-[10.5px] uppercase tracking-wide text-ink/45">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink/60">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  primary,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  tone?: "clay";
}) {
  const base = "rounded-lg px-[18px] py-3 text-[13.5px] font-semibold disabled:opacity-50";
  const style = primary
    ? "bg-teal text-white"
    : tone === "clay"
    ? "border border-clay/35 text-clay"
    : "border border-teal/40 bg-teal-soft text-teal";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${style}`}>
      {children}
    </button>
  );
}

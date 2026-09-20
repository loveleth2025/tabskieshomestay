"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Reservation } from "@/lib/types";
import { UNITS, UnitSlug } from "@/lib/units";
import { addDays, daysBetween, formatDateRange, formatShortDate } from "@/lib/dates";
import { computeBlockedRanges } from "@/lib/reservations";
import { ReservationStatusPill } from "@/components/StatusPill";

const WINDOW_DAYS = 14;
const ROW_UNITS: UnitSlug[] = ["bamboo-unit", "lower-unit", "whole-house"];

interface Bar {
  gridColumnStart: number;
  gridColumnEnd: number;
  label: string;
  kind: "confirmed" | "draft" | "blocked";
  href?: string;
}

function layout(checkIn: string, checkOut: string, windowStart: string) {
  const startIdx = daysBetween(windowStart, checkIn);
  const endIdx = daysBetween(windowStart, checkOut);
  const clampedStart = Math.max(0, startIdx);
  const clampedEnd = Math.min(WINDOW_DAYS, endIdx);
  if (clampedEnd <= clampedStart) return null;
  // Column 1 is the row label; day columns start at 2.
  return { gridColumnStart: 2 + clampedStart, gridColumnEnd: 2 + clampedEnd };
}

export default function CalendarPage() {
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");

  useEffect(() => {
    fetch("/api/admin/reservations")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setReservations(data.reservations);
        setDemo(data.demo);
      })
      .catch((err) => setError(err.message));
  }, []);

  const windowStart = useMemo(() => addDays(new Date(), -2), []);
  const windowDates = useMemo(
    () => Array.from({ length: WINDOW_DAYS }, (_, i) => addDays(windowStart, i)),
    [windowStart]
  );

  const barsByUnit = useMemo(() => {
    if (!reservations) return null;
    const blocked = computeBlockedRanges(reservations);
    const map: Record<UnitSlug, Bar[]> = {
      "bamboo-unit": [],
      "lower-unit": [],
      "whole-house": [],
    };

    for (const r of reservations) {
      if (r.paymentStatus === "Refunded") continue;
      const pos = layout(r.checkIn, r.checkOut, windowStart);
      if (!pos) continue;
      map[r.unitSlug].push({
        ...pos,
        label: `${r.fullName} · ${r.status}`,
        kind: r.status === "Draft" ? "draft" : "confirmed",
        href: `/admin/reservations?id=${r.id}`,
      });
    }

    for (const b of blocked) {
      const pos = layout(b.checkIn, b.checkOut, windowStart);
      if (!pos) continue;
      map[b.unitSlug].push({ ...pos, label: "Blocked", kind: "blocked" });
    }

    return map;
  }, [reservations, windowStart]);

  return (
    <main className="flex gap-7 p-7">
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold">
            {formatShortDate(windowDates[0])} – {formatShortDate(windowDates[windowDates.length - 1])}
          </h1>
          <div className="flex gap-1 rounded-xl border border-line bg-white p-1">
            <ViewTab active={view === "calendar"} onClick={() => setView("calendar")}>
              Calendar
            </ViewTab>
            <ViewTab active={view === "list"} onClick={() => setView("list")}>
              List
            </ViewTab>
          </div>
        </div>

        <div className="mb-3.5 flex items-center gap-[18px] text-xs text-ink/60">
          <Legend swatch="bg-teal" label="Confirmed" />
          <Legend swatch="bg-ochre" label="Draft" />
          <Legend
            swatch="bg-[repeating-linear-gradient(45deg,rgba(32,48,44,0.25),rgba(32,48,44,0.25)_2px,rgba(32,48,44,0.08)_2px,rgba(32,48,44,0.08)_5px)]"
            label="Blocked by Whole House"
          />
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}
        {demo && (
          <p className="mb-3 text-xs text-ochre">
            Showing demo data — set N8N_RESERVATIONS_WEBHOOK_URL to connect your real sheet.
          </p>
        )}

        {!reservations && !error && <p className="text-sm text-ink/50">Loading…</p>}

        {reservations && barsByUnit && view === "calendar" && (
          <div className="overflow-x-auto rounded-2xl border border-line bg-white p-5">
            <div
              className="grid items-center"
              style={{ gridTemplateColumns: `168px repeat(${WINDOW_DAYS}, 62px)` }}
            >
              <div />
              {windowDates.map((d) => (
                <div key={d} className="text-center text-[11px] text-ink/45">
                  {new Date(d).getDate()}
                </div>
              ))}
            </div>
            <div className="my-2 h-px bg-line" style={{ gridColumn: "1 / -1" }} />

            {ROW_UNITS.map((slug) => (
              <div
                key={slug}
                className="grid items-center border-t border-black/5 py-1.5"
                style={{ gridTemplateColumns: `168px repeat(${WINDOW_DAYS}, 62px)`, minHeight: 62 }}
              >
                <div className="text-[13px] font-semibold">{UNITS[slug].name}</div>
                {barsByUnit[slug].map((bar, i) => (
                  <BarEl key={i} bar={bar} />
                ))}
              </div>
            ))}
          </div>
        )}

        {reservations && view === "list" && (
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="grid grid-cols-[1.3fr_1.3fr_1.4fr_1fr] border-b border-line px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-ink/45">
              <span>Unit</span>
              <span>Guest</span>
              <span>Dates</span>
              <span>Status</span>
            </div>
            {[...reservations]
              .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
              .map((r) => (
                <Link
                  key={r.id}
                  href={`/admin/reservations?id=${r.id}`}
                  className="grid grid-cols-[1.3fr_1.3fr_1.4fr_1fr] items-center border-b border-black/5 px-5 py-3.5 text-[13.5px] hover:bg-sand/60"
                >
                  <span className="font-semibold">{UNITS[r.unitSlug].name}</span>
                  <span>{r.fullName}</span>
                  <span className="text-ink/60">{formatDateRange(r.checkIn, r.checkOut)}</span>
                  <ReservationStatusPill status={r.status} />
                </Link>
              ))}
          </div>
        )}
      </div>

      <aside className="w-[280px] flex-none">
        <div className="grid grid-cols-2 gap-3">
          <Stat value={reservations?.filter((r) => r.status === "Confirmed").length ?? "–"} label="Confirmed stays" />
          <Stat
            value={reservations?.filter((r) => r.paymentStatus === "Partial (Deposit Paid)").length ?? "–"}
            label="Pending deposits"
            tone="ochre"
          />
          <Stat
            value={reservations?.filter((r) => r.status === "Draft").length ?? "–"}
            label="Draft holds awaiting confirmation"
            span
          />
        </div>
      </aside>
    </main>
  );
}

function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold ${
        active ? "bg-teal text-white" : "text-ink/60"
      }`}
    >
      {children}
    </button>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${swatch}`} />
      {label}
    </span>
  );
}

function BarEl({ bar }: { bar: Bar }) {
  const style = { gridColumn: `${bar.gridColumnStart} / ${bar.gridColumnEnd}` };
  const inner = (
    <div
      style={style}
      className={`flex h-[34px] items-center overflow-hidden whitespace-nowrap rounded-lg px-2.5 text-[11.5px] font-semibold ${
        bar.kind === "confirmed"
          ? "bg-teal text-white"
          : bar.kind === "draft"
          ? "bg-ochre text-[#6E4A1D]"
          : "justify-center bg-[repeating-linear-gradient(45deg,rgba(32,48,44,0.16),rgba(32,48,44,0.16)_3px,rgba(32,48,44,0.05)_3px,rgba(32,48,44,0.05)_7px)] text-ink/55"
      }`}
    >
      {bar.label}
    </div>
  );
  return bar.href ? (
    <Link href={bar.href} style={style} className="contents">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function Stat({
  value,
  label,
  tone,
  span,
}: {
  value: number | string;
  label: string;
  tone?: "ochre";
  span?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-line bg-white p-3.5 ${span ? "col-span-2" : ""}`}>
      <div className={`font-display text-2xl font-semibold ${tone === "ochre" ? "text-ochre" : ""}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-ink/55">{label}</div>
    </div>
  );
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(base: Date | string, days: number): string {
  const d = typeof base === "string" ? new Date(base) : new Date(base.getTime());
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

export function formatDateRange(checkIn: string, checkOut: string): string {
  return `${formatShortDate(checkIn)} – ${formatShortDate(checkOut)}`;
}

import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sand">
      <header className="flex h-[68px] items-center justify-between border-b border-line bg-white px-6">
        <div className="flex items-center gap-8">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-semibold italic">Tabskie&apos;s</span>
            <span className="text-[10px] uppercase tracking-wide text-ink/45">OS</span>
          </div>
          <nav className="flex items-center gap-1">
            <AdminNavLink href="/admin/calendar">Calendar</AdminNavLink>
            <AdminNavLink href="/admin/reservations">Reservations</AdminNavLink>
          </nav>
        </div>
        <Link
          href="/"
          className="rounded-lg bg-teal px-4 py-2 text-[13px] font-semibold text-white"
        >
          + New reservation
        </Link>
      </header>
      {children}
    </div>
  );
}

function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-ink/60 hover:bg-teal-soft hover:text-teal"
    >
      {children}
    </Link>
  );
}

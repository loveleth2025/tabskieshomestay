import Link from "next/link";
import { MapPinIcon, SearchIcon, UsersIcon } from "@/components/Icons";
import { UNIT_LIST } from "@/lib/units";
import { formatPHP } from "@/lib/pricing";
import { publicFileExists } from "@/lib/media";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-16 pt-6 sm:px-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display italic text-2xl font-semibold leading-none">
            Tabskie&apos;s
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-ink/55">
            Homestay &amp; Travel
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2">
          <MapPinIcon width={14} height={14} className="text-teal" />
          <span className="text-xs font-medium">Camiguin, PH</span>
        </div>
      </div>

      <div
        className="relative mt-5 flex h-44 items-end overflow-hidden rounded-2xl bg-teal-dark bg-cover bg-center p-5 sm:h-56"
        style={publicFileExists("hero.jpg") ? { backgroundImage: "url(/hero.jpg)" } : undefined}
      >
        <div className="absolute inset-0 bg-black/15" />
        <div className="relative font-display text-2xl font-medium leading-tight text-white sm:text-3xl">
          Your island escape
          <br />
          in Camiguin
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-ink/50">
            Check-in
          </div>
          <div className="text-sm font-medium">Add date</div>
        </div>
        <div className="h-8 w-px bg-line" />
        <div className="flex-1 text-right">
          <div className="text-[10px] uppercase tracking-wider text-ink/50">
            Check-out
          </div>
          <div className="text-sm font-medium">Add date</div>
        </div>
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-teal text-white">
          <SearchIcon width={16} height={16} />
        </div>
      </div>

      <div className="mb-3 mt-7 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold">Choose your stay</h2>
      </div>

      <div className="flex flex-col gap-3.5">
        {UNIT_LIST.map((unit) => (
          <Link
            key={unit.slug}
            href={`/units/${unit.slug}`}
            className="block overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-teal/40"
          >
            <div
              className="flex h-28 items-center justify-center bg-[#DCE3D8] bg-cover bg-center text-[11px] text-ink/40"
              style={
                publicFileExists(unit.heroImage)
                  ? { backgroundImage: `url(${unit.heroImage})` }
                  : undefined
              }
            >
              {!publicFileExists(unit.heroImage) && <span>[ {unit.name} photo ]</span>}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold">{unit.name}</span>
                <span className="font-display text-[15px] font-semibold text-teal">
                  {formatPHP(unit.ratePerNight)}
                  <span className="font-body text-[11px] font-normal text-ink/55">
                    {" "}
                    /night
                  </span>
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-ink/60">
                <span className="flex items-center gap-1">
                  <UsersIcon width={13} height={13} />
                  Sleeps {unit.maxGuests}
                </span>
                <span>{unit.shortDescription}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

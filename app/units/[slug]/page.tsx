import type { ComponentType } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUnit, UNIT_LIST } from "@/lib/units";
import { formatPHP } from "@/lib/pricing";
import { publicFileExists } from "@/lib/media";
import {
  ChevronLeftIcon,
  WifiIcon,
  SnowflakeIcon,
  KitchenIcon,
  BalconyIcon,
  ShowerIcon,
  BeachIcon,
  StepFreeIcon,
  HouseIcon,
  BulbIcon,
} from "@/components/Icons";

const AMENITY_ICONS: Record<string, ComponentType<{ width?: number; height?: number; className?: string }>> = {
  "Wi-Fi": WifiIcon,
  "Air conditioning": SnowflakeIcon,
  Kitchenette: KitchenIcon,
  "Full kitchen": KitchenIcon,
  "Private balcony": BalconyIcon,
  "Hot & cold shower": ShowerIcon,
  "Beach access": BeachIcon,
  "Step-free access": StepFreeIcon,
  "Exclusive use of the property": BeachIcon,
  "Outdoor dining": KitchenIcon,
  "Family room": HouseIcon,
  "Solar-powered emergency lighting": BulbIcon,
};

export function generateStaticParams() {
  return UNIT_LIST.map((unit) => ({ slug: unit.slug }));
}

export default function UnitDetailPage({ params }: { params: { slug: string } }) {
  const unit = getUnit(params.slug);
  if (!unit) return notFound();

  const galleryPhotos = (unit.gallery ?? []).filter(publicFileExists);

  return (
    <main className="mx-auto max-w-3xl pb-28 sm:px-8">
      <div
        className="relative flex h-64 items-center justify-center bg-[#DCE3D8] bg-cover bg-center text-xs text-ink/40 sm:h-80 sm:rounded-b-2xl"
        style={
          publicFileExists(unit.heroImage)
            ? { backgroundImage: `url(${unit.heroImage})` }
            : undefined
        }
      >
        {!publicFileExists(unit.heroImage) && (
          <span>[ add {unit.heroImage} to /public to show a real photo ]</span>
        )}
        <Link
          href="/"
          aria-label="Back"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90"
        >
          <ChevronLeftIcon width={17} height={17} className="text-ink" />
        </Link>
      </div>

      {galleryPhotos.length > 0 && (
        <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pt-3.5 sm:px-0 sm:pt-4">
          {galleryPhotos.map((photo) => (
            <div
              key={photo}
              className="h-24 w-32 flex-none snap-start overflow-hidden rounded-xl bg-[#DCE3D8] bg-cover bg-center sm:h-28 sm:w-36"
              style={{ backgroundImage: `url(${photo})` }}
            />
          ))}
        </div>
      )}

      <div className="px-5 pt-5 sm:px-0">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          {unit.name}
        </h1>

        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:max-w-sm">
          <div className="rounded-xl border border-line bg-surface p-2.5 text-center">
            <div className="text-[15px] font-semibold">{unit.maxGuests}</div>
            <div className="mt-0.5 text-[10.5px] text-ink/55">Guests max</div>
          </div>
          <div className="rounded-xl border border-line bg-surface p-2.5 text-center">
            <div className="text-[15px] font-semibold">{unit.bedrooms}</div>
            <div className="mt-0.5 text-[10.5px] text-ink/55">Bedrooms</div>
          </div>
          <div className="rounded-xl border border-line bg-surface p-2.5 text-center">
            <div className="text-[15px] font-semibold">{unit.bathrooms}</div>
            <div className="mt-0.5 text-[10.5px] text-ink/55">Bathroom(s)</div>
          </div>
        </div>

        {unit.extraGuestFee && unit.baseGuests && (
          <p className="mt-3 text-[12px] text-ink/55">
            Rate covers up to {unit.baseGuests} guests. Extra guests up to {unit.maxGuests}{" "}
            total are {formatPHP(unit.extraGuestFee)}/person/night.
          </p>
        )}

        <p className="mt-4 text-[13.5px] leading-relaxed text-ink/75">
          {unit.description}
        </p>

        <h2 className="mb-3 mt-6 font-display text-base font-semibold">
          What this place offers
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {unit.amenities.map((amenity) => {
            const Icon = AMENITY_ICONS[amenity] ?? WifiIcon;
            return (
              <div key={amenity} className="flex items-center gap-2 text-[13px]">
                <Icon width={17} height={17} className="text-teal" />
                {amenity}
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 flex items-center gap-3.5 border-t border-line bg-surface px-5 py-3.5 sm:sticky sm:mt-8 sm:rounded-t-2xl">
        <div className="flex-1">
          <div className="font-display text-lg font-semibold text-teal">
            {formatPHP(unit.ratePerNight)}
            <span className="font-body text-xs font-normal text-ink/55">
              {" "}
              / night
            </span>
          </div>
          <div className="text-[11px] text-ink/50">50% deposit to confirm</div>
        </div>
        <Link
          href={`/book/${unit.slug}`}
          className="flex-none rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white"
        >
          Check availability
        </Link>
      </div>
    </main>
  );
}

export type UnitSlug = "bamboo-unit" | "lower-unit" | "whole-house";

export interface Unit {
  slug: UnitSlug;
  name: string;
  shortDescription: string;
  description: string;
  ratePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  combinesUnits?: UnitSlug[];
}

// Business rules locked in for Tabskies OS: three bookable inventory items.
// Whole House bidirectionally blocks Bamboo Unit + Lower Unit availability
// (enforced on the backend/n8n side, not here) — see README.
export const UNITS: Record<UnitSlug, Unit> = {
  "bamboo-unit": {
    slug: "bamboo-unit",
    name: "Bamboo Unit",
    shortDescription: "Stilted cabin",
    description:
      "A cozy stilted cabin tucked among bamboo groves, a short walk from the shoreline. Built with local hardwood and wide screened windows for the sea breeze — a quiet base for couples or small groups exploring Camiguin.",
    ratePerNight: 2500,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: [
      "Wi-Fi",
      "Air conditioning",
      "Kitchenette",
      "Private balcony",
      "Hot & cold shower",
      "Beach access",
    ],
  },
  "lower-unit": {
    slug: "lower-unit",
    name: "Lower Unit",
    shortDescription: "Ground floor",
    description:
      "A bright ground-floor unit with easy step-free access, ideal for families or guests who'd rather skip the stairs. Shares the same bamboo-grove grounds and shoreline access as the rest of the property.",
    ratePerNight: 2000,
    maxGuests: 3,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [
      "Wi-Fi",
      "Air conditioning",
      "Kitchenette",
      "Step-free access",
      "Hot & cold shower",
      "Beach access",
    ],
  },
  "whole-house": {
    slug: "whole-house",
    name: "Whole House",
    shortDescription: "Bamboo + Lower combined",
    description:
      "Both units combined into one private stay — the whole property to yourselves. The natural choice for larger groups or when Bamboo Unit and Lower Unit are booked together.",
    ratePerNight: 4000,
    maxGuests: 7,
    bedrooms: 3,
    bathrooms: 2,
    amenities: [
      "Wi-Fi",
      "Air conditioning",
      "Full kitchen",
      "Private balcony",
      "Hot & cold shower",
      "Beach access",
      "Exclusive use of the property",
    ],
    combinesUnits: ["bamboo-unit", "lower-unit"],
  },
};

export const UNIT_LIST = Object.values(UNITS);

export function getUnit(slug: string): Unit | undefined {
  return UNITS[slug as UnitSlug];
}

// If a guest count exceeds a unit's capacity, we flag it and suggest Whole
// House rather than blocking the request outright — see decisions.md:
// "Over-capacity requests are flagged with a Whole House suggestion rather
// than auto-rejected."
export function suggestsWholeHouse(unit: Unit, guests: number): boolean {
  return unit.slug !== "whole-house" && guests > unit.maxGuests;
}

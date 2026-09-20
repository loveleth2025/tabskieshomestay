export type UnitSlug = "bamboo-unit" | "lower-unit" | "whole-house";

export interface Unit {
  slug: UnitSlug;
  name: string;
  shortDescription: string;
  description: string;
  ratePerNight: number;
  maxGuests: number;
  // Guests included in ratePerNight before any per-person surcharge kicks
  // in. Undefined (or equal to maxGuests) means no surcharge ever applies.
  baseGuests?: number;
  // Per-person, per-night surcharge charged for guests beyond baseGuests,
  // up to maxGuests. Undefined means this unit doesn't offer extra guests.
  extraGuestFee?: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  combinesUnits?: UnitSlug[];
  // Path under /public — drop the actual photo file there with this exact
  // name and it will show up on the home page and the unit detail page.
  heroImage: string;
}

// Business rules locked in for Tabskies OS: three bookable inventory items.
// Whole House bidirectionally blocks Bamboo Unit + Lower Unit availability
// (enforced on the backend/n8n side, not here) — see README.
export const UNITS: Record<UnitSlug, Unit> = {
  "bamboo-unit": {
    slug: "bamboo-unit",
    name: "Bamboo Unit",
    shortDescription: "Bamboo-inspired retreat",
    description:
      "The Bamboo Unit offers a bamboo native-inspired vibe with a refreshing ocean breeze, paired with the comfort of modern living. Comes with a kitchenette, hot and cold shower, air conditioning, and solar-powered Starlink Wi-Fi with balcony.",
    ratePerNight: 3000,
    maxGuests: 6,
    bedrooms: 2,
    bathrooms: 1,
    amenities: [
      "Wi-Fi",
      "Air conditioning",
      "Kitchenette",
      "Private balcony",
      "Hot & cold shower",
    ],
    heroImage: "/units/bamboo-unit.jpg",
  },
  "lower-unit": {
    slug: "lower-unit",
    name: "Lower Unit",
    shortDescription: "Coastal comfort, steps from the beach",
    description:
      "Tabskie's Homestay: Coastal comfort meets modern charm just steps from the beach. Enjoy a blend of minimalist modern design and relaxed living. Free Wi-Fi, kitchenette, outdoor dining, and cozy family room. Explore the shoreline just minutes away. Perfect for a peaceful retreat or adventure-filled getaway in this island community, with an accessible location to start your adventure around Camiguin Island.",
    ratePerNight: 3000,
    maxGuests: 8,
    baseGuests: 6,
    extraGuestFee: 350,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Wi-Fi", "Kitchenette", "Outdoor dining", "Family room"],
    heroImage: "/units/lower-unit.jpg",
  },
  "whole-house": {
    slug: "whole-house",
    name: "Whole House",
    shortDescription: "Bamboo + Lower combined",
    description:
      "Discover our home's distinctive blend of a bamboo-inspired upper unit and modern simplicity in the lower unit. A brief 3-to-5-minute stroll immerses you in the vibrant community — visit the public market, or watch stunning sunsets while boating in summer. Unwind amidst Camiguin Island's natural splendor, with emergency solar-powered light bulbs and internet connection throughout.",
    ratePerNight: 6000,
    maxGuests: 14,
    bedrooms: 3,
    bathrooms: 2,
    amenities: [
      "Wi-Fi",
      "Full kitchen",
      "Solar-powered emergency lighting",
      "Exclusive use of the property",
    ],
    combinesUnits: ["bamboo-unit", "lower-unit"],
    heroImage: "/units/whole-house.jpg",
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

// The highest guest count any unit can ever reach (Whole House, currently).
// Used as the guest-stepper ceiling so a guest can dial up high enough on a
// smaller unit to trigger the Whole House suggestion above.
export const MAX_STEPPER_GUESTS = Math.max(...UNIT_LIST.map((u) => u.maxGuests));

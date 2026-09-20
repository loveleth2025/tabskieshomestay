import { notFound } from "next/navigation";
import { getUnit, UNIT_LIST } from "@/lib/units";
import { BookingWizard } from "@/components/booking/BookingWizard";

export function generateStaticParams() {
  return UNIT_LIST.map((unit) => ({ slug: unit.slug }));
}

export default function BookPage({ params }: { params: { slug: string } }) {
  const unit = getUnit(params.slug);
  if (!unit) return notFound();

  return <BookingWizard unit={unit} />;
}

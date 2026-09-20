export function GuestStepper({
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3.5">
      <button
        type="button"
        aria-label="Remove a guest"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 bg-white text-base leading-none"
      >
        −
      </button>
      <span className="min-w-[14px] text-center text-[15px] font-semibold">
        {value}
      </span>
      <button
        type="button"
        aria-label="Add a guest"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 bg-white text-base leading-none"
      >
        +
      </button>
    </div>
  );
}

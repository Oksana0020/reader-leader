/* Reference-led rule: student navigation is oversized, sparse, and confidence-building with teal outlines and gold home affordance. */
import Link from "next/link";
import { Home, Star } from "lucide-react";

export function StudentTopBar({ filledStars = 0 }: { filledStars?: number }) {
  return (
    <header className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-6 px-8 pt-8 sm:px-12 sm:pt-12">
      <Link aria-label="Return to story library" className="pressable grid size-14 place-items-center text-[var(--reader-gold)]" href="/">
        <Home aria-hidden="true" className="size-12 fill-current stroke-[2.4]" />
      </Link>
      <div aria-label={`${filledStars} of 5 reading stars earned`} className="flex h-16 flex-1 items-center justify-around rounded-full border-[4px] border-[var(--reader-teal)] px-3 text-[var(--reader-teal)]">
        {Array.from({ length: 5 }, (_, index) => (
          <Star aria-hidden="true" className="size-10" fill={index < filledStars ? "currentColor" : "none"} key={index} strokeWidth={1.8} />
        ))}
      </div>
    </header>
  );
}

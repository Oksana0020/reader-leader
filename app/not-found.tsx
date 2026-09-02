/* Reference-led rule: even recovery screens retain the warm cream canvas, bold teal voice, and one clear next action. */
import Link from "next/link";

export default function NotFound() {
  return <main className="student-canvas grid place-items-center px-6 text-center"><div><p className="text-7xl font-black text-[var(--reader-gold)]">404</p><h1 className="mt-3 text-4xl font-black text-[var(--reader-teal-deep)]">That page is not in this story.</h1><Link className="pressable mt-8 inline-flex rounded-full bg-[var(--reader-teal)] px-7 py-4 text-xl font-black text-white" href="/">Choose a Story</Link></div></main>;
}


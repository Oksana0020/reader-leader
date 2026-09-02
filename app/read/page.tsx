/* Reference-led rule: the reading route is a calm portrait composition with one dominant sentence card and oversized thumb-zone controls. */
import Link from "next/link";
import { ArrowBigLeft, ArrowBigRight, Mic } from "lucide-react";
import { StudentTopBar } from "@/components/student-top-bar";

export const metadata = { title: "Read Aloud" };

export default function ReadPage() {
  return (
    <main className="student-canvas flex flex-col pb-10">
      <StudentTopBar />
      <section className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-between px-9 pb-5 pt-28 sm:px-12">
        <div className="student-card grid min-h-[470px] place-items-center px-8 py-12 text-center sm:px-16">
          <p className="font-[var(--font-reading)] text-[4rem] leading-[1.22] font-semibold tracking-[-0.045em] text-[var(--reader-teal)] sm:text-[5rem]">The big <span className="text-[var(--reader-gold)]">cat</span> sat on the mat.</p>
        </div>
        <div className="mt-24 flex items-center justify-between gap-5">
          <button aria-label="Previous sentence" className="pressable text-[var(--reader-teal)]" type="button"><ArrowBigLeft className="size-24 fill-current stroke-[var(--reader-gold)] stroke-[3] sm:size-28" /></button>
          <div className="relative grid size-32 shrink-0 place-items-center rounded-full bg-[#68d0a0] text-white shadow-[0_0_34px_18px_rgba(104,208,160,0.35)] sm:size-36">
            <span className="absolute -inset-8 rounded-full border-4 border-[#65bcb1]/30" /><span className="absolute -inset-14 rounded-full border-4 border-[#65bcb1]/15" />
            <Mic aria-hidden="true" className="size-16" strokeWidth={2.3} />
          </div>
          <Link aria-label="Finish this reading" className="pressable text-[var(--reader-teal)]" href="/celebrate"><ArrowBigRight className="size-24 fill-current stroke-[var(--reader-gold)] stroke-[3] sm:size-28" /></Link>
        </div>
      </section>
    </main>
  );
}

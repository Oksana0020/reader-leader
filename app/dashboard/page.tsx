/* Reference-led rule: educator overview prioritises intervention, reading time, progress, class evidence, and phonetic gaps in the supplied mobile hierarchy. */
import Link from "next/link";
import { ArrowLeft, CircleUserRound, Clock3, SlidersHorizontal } from "lucide-react";
import { CLASS_STUDENTS } from "@/lib/seed";
import { EducatorBottomNav } from "@/components/educator-bottom-nav";
import { BrandMark } from "@/components/brand-mark";

export const metadata = { title: "Educator Insights" };
const gaps = [{ label: "Digraphs", value: 60, colour: "#d8940d" }, { label: "Tricky Words", value: 45, colour: "#e94d4d" }, { label: "Blending", value: 85, colour: "#42a962" }];

export default function DashboardPage() {
  return (
    <main className="educator-canvas px-4 pt-8 sm:px-10"><div className="mx-auto max-w-[900px]">
      <header><div className="flex items-center justify-between"><ArrowLeft aria-hidden="true" className="size-10" /><div className="flex items-center gap-2 text-center text-3xl font-extrabold"><BrandMark className="size-10" />Reader Leader</div><CircleUserRound aria-hidden="true" className="size-12" /></div><h1 className="mt-4 text-[3.1rem] leading-tight font-black tracking-[-0.04em] sm:text-[3.7rem]">Educator Insights</h1></header>
      <section className="no-scrollbar -mx-4 mt-7 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
        <article className="educator-card min-h-56 w-56 shrink-0 border-t-[10px] border-t-[#d99b11] bg-[#fff2dc] p-5 sm:w-auto"><p className="text-6xl font-black text-[#c67d00]">3</p><h2 className="mt-1 text-2xl leading-tight font-black">Priority Interventions</h2><p className="mt-3 text-xl leading-tight">Split digraphs focus needed.</p></article>
        <article className="educator-card min-h-56 w-56 shrink-0 border-t-[10px] border-t-[#6bc6c6] bg-[var(--reader-aqua)] p-5 sm:w-auto"><div className="flex items-start justify-between text-[var(--reader-teal)]"><p className="text-6xl font-black">14</p><Clock3 className="size-8" /></div><p className="text-2xl">mins/day</p><h2 className="mt-7 text-2xl leading-tight font-black">Average Reading Time</h2></article>
        <article className="educator-card min-h-56 w-56 shrink-0 border-t-[10px] border-t-[#42aa65] bg-[var(--reader-mint)] p-5 sm:w-auto"><h2 className="text-2xl leading-tight font-black">KS1 Phonics Phase 3</h2><div className="mt-5 h-11 overflow-hidden rounded-md bg-white"><div className="h-full w-3/4 bg-[#41ad65]" /></div><p className="mt-4 text-2xl leading-tight font-black">Curriculum Progress</p></article>
      </section>
      <section className="mt-5"><h2 className="flex items-center gap-3 text-3xl font-black">Class Overview <SlidersHorizontal className="size-8" /></h2><div className="educator-card mt-4 overflow-hidden"><div className="grid grid-cols-[1.35fr_.8fr_.7fr_.7fr] gap-2 border-b bg-[#f7f7fb] px-5 py-4 text-sm font-black sm:text-base"><span>Student Name</span><span>Book Band</span><span>Accuracy</span><span>WCPM</span></div>{CLASS_STUDENTS.map((student) => <Link className="grid grid-cols-[1.35fr_.8fr_.7fr_.7fr] items-center gap-2 border-b px-5 py-4 text-base last:border-b-0 sm:text-lg" href="/dashboard/student" key={student.id}><span className="font-semibold">{student.name}</span><span className="w-fit rounded-full bg-[var(--reader-gold)] px-3 py-1 text-sm font-black">{student.bookBand}</span><span>{student.accuracyRate}%</span><span>{student.wcpm}</span></Link>)}</div></section>
      <section className="mt-12"><h2 className="text-3xl font-black">Class Phonetic Gaps</h2><div className="educator-card mt-4 space-y-6 p-5">{gaps.map((gap) => <div key={gap.label}><div className="mb-2 flex justify-between text-lg"><span>{gap.label}</span><span>{gap.value}% Proficient</span></div><div className="h-5 overflow-hidden rounded-full bg-[#e3e5e9]"><div className="h-full rounded-full" style={{ width: `${gap.value}%`, backgroundColor: gap.colour }} /></div></div>)}</div></section>
      <EducatorBottomNav active="class" />
    </div></main>
  );
}

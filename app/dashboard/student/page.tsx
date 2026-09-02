/* Reference-led rule: the running record makes evidence readable at a glance, keeps machine review provisional, and centres educator judgement. */
import { CirclePlay } from "lucide-react";
import { EducatorBottomNav } from "@/components/educator-bottom-nav";
import { BrandMark } from "@/components/brand-mark";

export const metadata = { title: "Student Running Record" };

export default function StudentProfilePage() {
  return (
    <main className="educator-canvas px-5 pt-6 sm:px-8"><div className="mx-auto max-w-[1360px]">
      <header className="border-b border-slate-300 pb-5"><p className="flex items-center gap-2 text-2xl font-medium"><BrandMark className="size-9" />Reader Leader</p><h1 className="mt-1 text-[2.25rem] leading-tight font-black tracking-[-0.035em] sm:text-[2.85rem]">Student Profile &amp; Running Record</h1></header>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-300 py-5"><div className="flex flex-wrap items-center gap-4"><h2 className="text-3xl font-black">Jack Murphy</h2><span className="rounded-full bg-[#d7f1dd] px-4 py-2 text-lg text-[#235f2e]">Level 5: Green Book Band</span></div><button className="pressable rounded-xl bg-[var(--reader-teal)] px-5 py-3 text-lg text-white" type="button">Export for Parent-Teacher Meeting</button></div>
      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        <section className="educator-card min-h-[430px] p-6"><h2 className="text-2xl font-black">Running Record</h2><div className="mt-20 text-[2.4rem] leading-[1.9] tracking-[-0.03em] sm:text-[3.25rem]">The brave{" "}<span className="group relative inline-block text-[var(--reader-red)] underline decoration-dotted decoration-[3px] underline-offset-[10px]" tabIndex={0}>knight<span className="invisible absolute bottom-full left-1/2 z-10 mb-4 w-80 -translate-x-1/2 rounded-xl border border-slate-300 bg-white p-4 text-left text-base leading-snug text-black opacity-0 shadow-lg transition group-focus:visible group-focus:opacity-100 group-hover:visible group-hover:opacity-100"><strong className="flex items-center gap-2 text-lg"><CirclePlay className="size-6 text-slate-500" /> Listen to Attempt (2s)</strong><span className="mt-2 block">Child sounded out the silent ‘k’ (pronounced as /k-n-aɪ-t/).</span><span className="mt-2 block text-sm font-semibold text-[var(--reader-teal-deep)]">Provisional review · 0% penalty</span></span></span>{" "}went out into the cold night to find his lost{" "}<span className="rounded-lg bg-[var(--reader-amber)] px-2">horse.</span></div></section>
        <aside className="educator-card p-6"><h2 className="text-2xl font-black">Phonics Assessment History</h2><ol className="mt-8 space-y-9 border-l-4 border-slate-200 pl-6 text-lg"><li><strong>Today</strong><span className="mt-1 block">Reviewed sounded silent ‘k’ in “knight”</span></li><li><strong>1 Week Ago</strong><span className="mt-1 block">Mastered split digraph ‘i-e’</span></li><li><strong>3 Weeks Ago</strong><span className="mt-1 block">Moved from Blue to Green Book Band</span></li></ol></aside>
      </div>
      <EducatorBottomNav active="students" />
    </div></main>
  );
}

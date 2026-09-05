"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert, Gauge, Sparkles, TrendingUp } from "lucide-react";
import { useReaderSession } from "@/app/providers";
import { buildTeacherReport } from "@/lib/teacher-report";
import { SEEDED_RUNNING_RECORD } from "@/lib/seed";

export default function TeacherReportPage() {
  const { state } = useReaderSession();
  const alignment = state.session.alignment ?? SEEDED_RUNNING_RECORD;
  const teacherReport = buildTeacherReport(alignment);
  const relevantTokens = alignment.tokens.filter((token) => token.status !== "correct").slice(0, 6);

  return (
    <main className="educator-canvas min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="pressable inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-[var(--reader-teal-deep)] shadow-[0_8px_18px_rgba(18,55,76,0.08)]" href="/dashboard/student">
            <ArrowLeft className="size-4" />
            Back to student record
          </Link>
          <div className="rounded-full bg-slate-900 px-3 py-1.5 text-right text-white shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">Teacher report</p>
            <p className="text-sm font-black text-white">Reader Leader</p>
          </div>
        </header>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f4fbfb_100%)] p-6 shadow-[0_24px_60px_rgba(25,52,79,0.08)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--reader-teal-deep)]/75">Student review</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[var(--reader-teal-deep)] sm:text-5xl">Jack Murphy</h1>
              <p className="mt-3 text-lg text-slate-600">{state.session.storySnapshot.title} · {state.session.storySnapshot.bandLabel}</p>
            </div>
            <div className="max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-relaxed text-emerald-800">
              AI summary is post-read only. It supports teacher judgement, and it does not interrupt the child mid-sentence.
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Accuracy", value: `${alignment.metrics.accuracyRate}%`, icon: Gauge, tone: "bg-[var(--reader-teal-soft)] text-[var(--reader-teal-deep)] border-[var(--reader-teal)]/20" },
            { label: "WCPM", value: `${alignment.metrics.wcpm}`, icon: TrendingUp, tone: "bg-[#fff5d7] text-[var(--reader-gold-deep)] border-[#f2d680]" },
            { label: "False-correction", value: `${alignment.metrics.falseCorrectionRate.toFixed(1)}%`, icon: CircleAlert, tone: "bg-[#fef1f2] text-[#af354c] border-[#efb5bf]" },
            { label: "Regional variants", value: `${teacherReport.regionalCount}`, icon: Sparkles, tone: "bg-[#edf7f0] text-[#1e743a] border-[#b8dfc5]" },
          ].map(({ label, value, icon: Icon, tone }) => (
            <article className={`rounded-[1.7rem] border bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.06)] ${tone}`} key={label}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-[0.16em]">{label}</p>
                <Icon className="size-6" />
              </div>
              <p className="mt-6 text-4xl font-black tracking-[-0.05em]">{value}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_38px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-[var(--reader-teal-soft)]">
                <CheckCircle2 className="size-5 text-[var(--reader-teal)]" />
              </div>
              <h2 className="text-2xl font-black text-[var(--reader-teal-deep)]">Teacher summary</h2>
            </div>
            <p className="mt-4 text-lg leading-relaxed text-slate-700">{teacherReport.overview}</p>
            <ul className="mt-5 space-y-3">
              {teacherReport.highlights.map((item) => (
                <li className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700" key={item}>
                  <span className="mt-1.5 size-2 rounded-full bg-[var(--reader-teal)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">{teacherReport.caution}</p>
          </article>

          <aside className="rounded-[2rem] border border-slate-200 bg-[#f7fafc] p-6 shadow-[0_18px_38px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Recommended next step</p>
            <p className="mt-4 text-lg font-bold leading-relaxed text-slate-800">{teacherReport.nextStep}</p>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Focus</p>
                <p className="mt-2 text-lg font-bold text-[var(--reader-teal-deep)]">{state.session.storySnapshot.focus}</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Book band</p>
                <p className="mt-2 text-lg font-bold text-[var(--reader-teal-deep)]">{state.session.storySnapshot.bandLabel}</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_38px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-[var(--reader-teal-deep)]">Evidence notes</h2>
            <span className="rounded-full bg-[var(--reader-teal-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--reader-teal-deep)]">{relevantTokens.length} flagged tokens</span>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1.2fr_1fr_1.3fr] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
              <span>Word</span>
              <span>Status</span>
              <span>Note</span>
            </div>
            {relevantTokens.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-600">No provisional flags were triggered during this read.</div>
            ) : (
              relevantTokens.map((token) => (
                <div className="grid grid-cols-[1.2fr_1fr_1.3fr] gap-3 border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-700" key={token.id}>
                  <span className="font-bold text-[var(--reader-teal-deep)]">{token.token}</span>
                  <span className="font-semibold capitalize text-slate-600">{token.status.replace(/-/g, " ")}</span>
                  <span>
                    {token.status === "accepted-regional-variant"
                      ? `${token.explanation ?? "Accepted as a regional variant."} ${token.heardAs ? `Heard as: ${token.heardAs}.` : ""}`
                      : token.explanation ?? "No extra note recorded."}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

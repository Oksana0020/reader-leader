"use client";

/** Pitch evidence rule: make the restraint comparison measurable without diluting the celebration screen. */
import { useReaderSession } from "@/app/providers";

export function SessionOutcomePill() {
  const { state } = useReaderSession();
  const alignment = state.session.alignment;
  if (!alignment) return null;
  const regional = alignment.evaluationMode === "regional-restraint";
  return (
    <div className={`mt-8 rounded-full px-5 py-2 text-base font-black ${regional ? "bg-emerald-100 text-emerald-800" : "bg-[#fff0c8] text-[var(--reader-gold-deep)]"}`} role="status">
      {regional ? "Agent restraint" : "Baseline ASR comparison"} · False-Correction Rate: {alignment.metrics.falseCorrectionRate.toFixed(1)}%
    </div>
  );
}

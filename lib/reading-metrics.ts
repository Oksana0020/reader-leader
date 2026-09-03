/** Educator evidence rule: only score-impacting classifications reduce accuracy; accepted AI restraint and teacher overrides remain distinct. */
import type { AlignmentResponse, ReadingMetrics, TokenAlignment } from "@/lib/domain";

export function calculateReadingMetrics(tokens: TokenAlignment[], elapsedSeconds: number): ReadingMetrics {
  const total = Math.max(tokens.length, 1);
  const accepted = tokens.filter((token) => !token.scoreImpact).length;
  const falseCorrections = tokens.filter((token) => token.falseCorrection).length;
  const minutes = Math.max(elapsedSeconds / 60, 1 / 60);

  return {
    accuracyRate: Math.round((accepted / total) * 100),
    wcpm: Math.round(accepted / minutes),
    elapsedSeconds: Math.max(Math.round(elapsedSeconds), 1),
    falseCorrectionRate: Number(((falseCorrections / total) * 100).toFixed(1)),
  };
}

export function recalculateAlignmentMetrics(alignment: AlignmentResponse): AlignmentResponse {
  return {
    ...alignment,
    metrics: calculateReadingMetrics(alignment.tokens, alignment.metrics.elapsedSeconds),
  };
}

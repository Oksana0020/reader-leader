/** Teaching insight engine: convert reading evidence into concrete phonics next steps for the educator dashboard. */
import type { TokenAlignment } from "@/lib/domain";

export type PhonicsGapInsight = {
  label: string;
  summary: string;
};

const SILENT_LETTER_TOKENS = new Set(["knight", "night", "knee", "knife"]);
const RHOTIC_TOKENS = new Set(["horse", "for", "four", "fore"]);

export function buildPhonicsGapInsights(tokens: Pick<TokenAlignment, "token" | "status" | "scoreImpact">[]) {
  const silentLetterIssues = tokens.filter((token) => SILENT_LETTER_TOKENS.has(token.token.toLowerCase().replace(/[^a-z]/g, "")) && token.status !== "correct");
  const rhoticIssues = tokens.filter((token) => RHOTIC_TOKENS.has(token.token.toLowerCase().replace(/[^a-z]/g, "")) && token.status !== "correct");
  const scoreImpactIssues = tokens.filter((token) => token.scoreImpact);

  const insights: PhonicsGapInsight[] = [];

  if (silentLetterIssues.length > 0) {
    insights.push({
      label: "Silent letter pattern",
      summary: `Review the silent-letter pattern in ${silentLetterIssues.map((token) => token.token).join(", ")}. Keep the cue gentle and maintain the child’s fluency rather than interrupting mid-read.`,
    });
  }

  if (rhoticIssues.length > 0) {
    insights.push({
      label: "Rhotic variation",
      summary: `Accent-safe review found a rhotic or regional pronunciation pattern in ${rhoticIssues.map((token) => token.token).join(", ")}. This should be logged as evidence, not as a child-facing correction.`,
    });
  }

  if (scoreImpactIssues.length > 0) {
    insights.push({
      label: "Intervention trigger",
      summary: `${scoreImpactIssues.length} word${scoreImpactIssues.length === 1 ? "" : "s"} currently have a score-impacting result. Re-test with the gentle cue before moving to a formal correction plan.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      label: "No immediate gap",
      summary: "This reading remains stable: no active phonics gap is flagged, and the student can continue with confidence building tasks.",
    });
  }

  return insights.slice(0, 3);
}

/** Teacher-facing summary rules: keep post-read review provisional, evidence-based, and strictly non-AI. */
import type { AlignmentResponse, TokenAlignment } from "@/lib/domain";

function humaniseToken(token: TokenAlignment): string {
  return token.token.replace(/[.,!?]/g, "");
}

export function buildTeacherReport(alignment: AlignmentResponse) {
  const reviewCount = alignment.tokens.filter((token) => ["review", "substitution", "omission"].includes(token.status)).length;
  const regionalCount = alignment.tokens.filter((token) => token.status === "accepted-regional-variant").length;
  const overrideCount = alignment.tokens.filter((token) => token.status === "accepted-teacher-override").length;
  const scoreImpactCount = alignment.tokens.filter((token) => token.scoreImpact).length;
  const phonicsFocus = alignment.tokens.find((token) => ["knight", "horse"].includes(token.token.toLowerCase().replace(/[^a-z]/g, ""))) ?? null;

  const overview = reviewCount === 0 && scoreImpactCount === 0
    ? "This reading stayed within the agreed restraint pattern and required no direct correction."
    : scoreImpactCount > 0
      ? "This reading includes a small number of score-impacting classifications that should be checked before finalising the report."
      : "This reading was treated with restraint and is ready for a quick educator review.";

  const highlights = [
    regionalCount > 0 ? `Regional restraint accepted ${regionalCount} accent-safe variation${regionalCount === 1 ? "" : "s"}.` : "No regional variant was flagged for automatic acceptance.",
    overrideCount > 0 ? `Teacher override accepted ${overrideCount} sound decision${overrideCount === 1 ? "" : "s"}.` : "No teacher override was needed for this read.",
    phonicsFocus ? `Phonics focus remained on “${humaniseToken(phonicsFocus)}” throughout the review.` : "No specific phonics focus was flagged in this session.",
  ];

  const caution = reviewCount > 0
    ? `Provisional review flagged ${reviewCount} word${reviewCount === 1 ? "" : "s"} for educator judgement.`
    : "No provisional warnings require immediate action for this read.";

  const nextStep = overrideCount > 0 || reviewCount > 0
    ? "Use the running record to confirm the teacher override or approve the provisional review."
    : "This record is ready for a parent-teacher handoff without further speech correction.";

  return {
    overview,
    highlights,
    caution,
    nextStep,
    reviewCount,
    regionalCount,
    overrideCount,
  };
}

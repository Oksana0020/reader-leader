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
  const acceptedRegionalTokens = alignment.tokens.filter((token) => token.status === "accepted-regional-variant");
  const phonicsFocus = alignment.tokens.find((token) => ["knight", "horse"].includes(token.token.toLowerCase().replace(/[^a-z]/g, ""))) ?? null;

  const overview = reviewCount === 0 && scoreImpactCount === 0
    ? "This read remained within the agreed accent-safe pattern. The system kept the child’s flow calm and recorded no score-impacting corrections."
    : scoreImpactCount > 0
      ? "This reading includes a small number of score-impacting classifications that should be checked before finalising the teacher summary."
      : "This reading was treated with restraint and is ready for a quick educator review of accepted regional variation.";

  const highlights = [
    regionalCount > 0
      ? `Accepted regional variation: ${regionalCount} word${regionalCount === 1 ? "" : "s"} was treated as accent-safe and remained non-penalising (${acceptedRegionalTokens.map((token) => humaniseToken(token)).join(", ")}).`
      : "No accepted regional variant was recorded during this read, so the evidence remained standard pronunciation only.",
    overrideCount > 0 ? `Teacher override accepted ${overrideCount} sound decision${overrideCount === 1 ? "" : "s"} after the live read.` : "No teacher override was needed for this read.",
    phonicsFocus ? `Phonics focus remained on “${humaniseToken(phonicsFocus)}” during the review and the evidence note stays tied to that target sound.` : "No specific phonics focus was flagged in this session.",
  ];

  const caution = reviewCount > 0
    ? `Provisional review flagged ${reviewCount} word${reviewCount === 1 ? "" : "s"} for educator judgement before the reading record is finalised.`
    : "No provisional warnings require immediate action for this read.";

  const nextStep = overrideCount > 0 || reviewCount > 0
    ? "Review the evidence notes, confirm any teacher override, and then finalise the running record with the educator’s decision."
    : "This record is ready for a parent-teacher handoff without any further speech correction or teacher override.";

  return {
    overview,
    highlights,
    caution,
    nextStep,
    reviewCount,
    regionalCount,
    overrideCount,
    acceptedRegionalTokens,
  };
}

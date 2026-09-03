/* Reference-led rule: the mock alignment boundary protects accent and phonics restraint before educator evidence is rendered. */
import { NextResponse } from "next/server";
import { z } from "zod";
import type { AlignmentResponse, TokenAlignment } from "@/lib/domain";
import { calculateReadingMetrics } from "@/lib/reading-metrics";

const requestSchema = z.object({
  sessionId: z.string().min(1),
  storyId: z.enum(["fat-cat", "big-dog", "sun-bun", "pig-in-mud", "red-hen", "frog-log", "bears-hat", "ship-trip", "fox-box", "brave-knight"]),
  targetText: z.string().min(1),
  localeProfile: z.enum(["en-GB", "en-IE"]),
  evaluationMode: z.enum(["standard-rp", "regional-restraint"]),
  elapsedMs: z.number().nonnegative(),
  isFinal: z.boolean(),
  currentTokenIndex: z.number().int().nonnegative().optional(),
  audioBytes: z.number().int().nonnegative().optional(),
  demoAttempt: z.enum(["standard", "sounded-silent-k"]).optional(),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_ALIGNMENT_REQUEST", issues: z.treeifyError(parsed.error) }, { status: 400 });

  const input = parsed.data;
  const words = input.targetText.trim().split(/\s+/);
  const elapsedSeconds = Math.max(input.elapsedMs / 1000, 1);
  const tokens: TokenAlignment[] = words.map((token, index) => {
    const normalised = token.toLowerCase().replace(/[^a-z']/g, "");
    if (normalised === "knight" && input.demoAttempt === "sounded-silent-k") {
      return { id: `${input.sessionId}-${index}`, token, index, status: "review", confidence: 0.86, heardAs: "k-night", phoneticDisplay: "/k-n-aɪ-t/", explanation: "Child sounded out the silent ‘k’ (pronounced as /k-n-aɪ-t/).", scoreImpact: false, cueRecommendation: "Stay neutral while the educator reviews the attempt." };
    }
    if (normalised === "knight") {
      return { id: `${input.sessionId}-${index}`, token, index, status: input.evaluationMode === "regional-restraint" ? "accepted-regional-variant" : "correct", confidence: 0.99, heardAs: "night", phoneticDisplay: "/n-aɪ-t/", explanation: "Correct reading: the initial ‘k’ is silent.", scoreImpact: false };
    }
    if (normalised === "horse" && input.evaluationMode === "regional-restraint") {
      return { id: `${input.sessionId}-${index}`, token, index, status: "accepted-regional-variant", confidence: 0.97, heardAs: "rhotic horse", phoneticDisplay: "/hɔːrs/", explanation: "Accepted rhotic /r/ in Hiberno-English and Northern Irish speech. Reader Leader stays silent.", scoreImpact: false };
    }
    if (normalised === "horse" && input.evaluationMode === "standard-rp") {
      return { id: `${input.sessionId}-${index}`, token, index, status: "substitution", confidence: 0.72, heardAs: "rhotic horse", phoneticDisplay: "/hɔːrs/", explanation: "Baseline ASR simulated a false correction for the regional rhotic /r/.", scoreImpact: true, falseCorrection: true, cueRecommendation: "Amber interrupt: repeat using the baseline pronunciation model." };
    }
    return { id: `${input.sessionId}-${index}`, token, index, status: "correct", confidence: 0.98, scoreImpact: false };
  });

  const response: AlignmentResponse = {
    sessionId: input.sessionId, localeProfile: input.localeProfile,
    evaluationMode: input.evaluationMode,
    restraintApplied: tokens.some((token) => token.status === "accepted-regional-variant"),
    lastConfirmedTokenIndex: tokens.length - 1, tokens,
    metrics: calculateReadingMetrics(tokens, elapsedSeconds),
  };
  return NextResponse.json(response);
}

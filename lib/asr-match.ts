/** Demo ASR boundary: normalize transcript text and map it to the currently active word while preserving accent-safe acceptance rules. */
import type { EvaluationMode } from "@/lib/domain";

export function normalizeAsrToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z]/g, "");
}

export function tokenizeAsrTranscript(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .map((candidate) => candidate.trim())
    .filter(Boolean);
}

export function isAccentSafeMatch(currentToken: string, recognizedToken: string, evaluationMode: EvaluationMode): boolean {
  const current = normalizeAsrToken(currentToken);
  const recognized = normalizeAsrToken(recognizedToken);

  if (!current || !recognized) return false;
  if (current === recognized) return true;

  if (current === "knight" && recognized === "night") return true;
  if (current === "horse" && evaluationMode === "regional-restraint" && (recognized === "horse" || recognized === "hoarse")) return true;
  if (current === "horse" && evaluationMode === "standard-rp" && recognized === "hoarse") return true;

  return false;
}

export function getMatchingTranscriptWord(currentToken: string, transcriptText: string, evaluationMode: EvaluationMode): string | null {
  const tokens = tokenizeAsrTranscript(transcriptText);
  const current = normalizeAsrToken(currentToken);

  if (!current || tokens.length === 0) return null;

  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const candidate = tokens[index];
    if (candidate === current) return candidate;
    if (isAccentSafeMatch(currentToken, candidate, evaluationMode)) {
      return candidate;
    }
  }

  if (current.length <= 4) {
    const exactStem = tokens.find((candidate) => normalizeAsrToken(candidate).startsWith(current.slice(0, 2)));
    if (exactStem) return exactStem;
  }

  return null;
}

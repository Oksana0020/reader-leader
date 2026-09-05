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

  const silentKVariants = new Set(["knight", "night"]);
  if (silentKVariants.has(current) && silentKVariants.has(recognized)) return true;

  const rhoticVariants = new Set(["horse", "hoarse"]);
  if (rhoticVariants.has(current) && rhoticVariants.has(recognized)) {
    return evaluationMode === "regional-restraint" || current === "hoarse" || recognized === "hoarse";
  }

  if (current === "horse" && evaluationMode === "standard-rp" && recognized === "hoarse") return true;
  if (current === "hoarse" && evaluationMode === "standard-rp" && recognized === "horse") return true;

  return false;
}

export function getMatchingTranscriptWord(currentToken: string, transcriptText: string, evaluationMode: EvaluationMode): string | null {
  const tokens = tokenizeAsrTranscript(transcriptText);
  const current = normalizeAsrToken(currentToken);

  if (!current || tokens.length === 0) return null;

  const lastRelevantWindow = tokens.slice(-Math.min(tokens.length, 12));

  for (let index = lastRelevantWindow.length - 1; index >= 0; index -= 1) {
    const candidate = lastRelevantWindow[index];
    const normalized = normalizeAsrToken(candidate);

    if (!normalized) continue;
    if (normalized === current) return candidate;
    if (isAccentSafeMatch(currentToken, candidate, evaluationMode)) {
      return candidate;
    }
  }

  if (current.length <= 4) {
    const prefix = current.slice(0, Math.min(2, current.length));
    for (let index = lastRelevantWindow.length - 1; index >= 0; index -= 1) {
      const candidate = lastRelevantWindow[index];
      const normalized = normalizeAsrToken(candidate);
      if (!normalized) continue;
      if (normalized.startsWith(prefix) && normalized.length >= 3 && normalized.length <= current.length + 2) {
        return candidate;
      }
    }
  }

  return null;
}

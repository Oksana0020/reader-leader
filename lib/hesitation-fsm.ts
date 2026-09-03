/** Student restraint rule: silence offers support at 3s and 5s without creating a pronunciation penalty. */
import type { EvaluationMode, HesitationEvent, HesitationMachine } from "@/lib/domain";

// Fast-paced demo thresholds for stage presentation
export const HESITATION_THRESHOLD_MS = 2_000;          // Turns amber at 2.0s of silence (down from 3.0s)
export const PROMPT_THRESHOLD_MS = 3_800;              // Reveals phonetic cue at 3.8s total (down from 5.0s)

// Baseline ASR vs Final Navigation Sequencing
export const BASELINE_ASR_PATIENCE_MS = 800;           // Shows baseline error after 800ms on "horse"
export const FINAL_TOKEN_AUTO_FINISH_PAUSE_MS = 2_400; // Holds canvas for 2.4s so audience sees the baseline pill
export const INITIAL_TOKEN_INDEX = 0;

export function shouldShowBaselineInterrupt(evaluationMode: EvaluationMode, token: string, isActive: boolean, silenceMs: number): boolean {
  return evaluationMode === "standard-rp"
    && token.toLowerCase().replace(/[^a-z']/g, "") === "horse"
    && isActive
    && silenceMs >= BASELINE_ASR_PATIENCE_MS;
}

export function advanceTokenIndex(currentIndex: number, tokenCount: number): number {
  return Math.min(Math.max(tokenCount - 1, 0), currentIndex + 1);
}

export function shouldAutoFinishReading(currentIndex: number, tokenCount: number, finalTokenSpoken: boolean, silenceMs: number): boolean {
  return tokenCount > 0
    && currentIndex === tokenCount - 1
    && finalTokenSpoken
    && silenceMs >= FINAL_TOKEN_AUTO_FINISH_PAUSE_MS;
}

export const INITIAL_HESITATION_MACHINE: HesitationMachine = {
  phase: "idle",
  silenceStartedAtMs: null,
  silenceMs: 0,
  lastSpeechAtMs: null,
};

export function hesitationReducer(
  state: HesitationMachine,
  event: HesitationEvent,
): HesitationMachine {
  switch (event.type) {
    case "REQUEST_PERMISSION":
      return { ...INITIAL_HESITATION_MACHINE, phase: "requesting-permission" };
    case "PERMISSION_GRANTED":
      return { phase: "listening", silenceStartedAtMs: event.atMs, silenceMs: 0, lastSpeechAtMs: null };
    case "PERMISSION_DENIED":
      return { ...INITIAL_HESITATION_MACHINE, phase: "permission-denied" };
    case "UNSUPPORTED":
      return { ...INITIAL_HESITATION_MACHINE, phase: "unsupported" };
    case "SPEECH":
      return { phase: "speaking", silenceStartedAtMs: null, silenceMs: 0, lastSpeechAtMs: event.atMs };
    case "SILENCE": {
      const silenceStartedAtMs = state.silenceStartedAtMs ?? event.atMs;
      const silenceMs = Math.max(0, event.atMs - silenceStartedAtMs);
      const phase = silenceMs >= PROMPT_THRESHOLD_MS
        ? "prompting"
        : silenceMs >= HESITATION_THRESHOLD_MS
          ? "hesitating"
          : "listening";
      return { ...state, phase, silenceStartedAtMs, silenceMs };
    }
    case "BEGIN_FINISH":
      return { ...state, phase: "finishing" };
    case "FINISHED":
      return { ...state, phase: "complete" };
    case "FAIL":
      return { ...state, phase: "error" };
    case "RESET":
      return INITIAL_HESITATION_MACHINE;
  }
}

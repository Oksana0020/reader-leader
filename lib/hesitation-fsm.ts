/** Student restraint rule: silence offers support at 3s and 5s without creating a pronunciation penalty. */
import type { HesitationEvent, HesitationMachine } from "@/lib/domain";

export const HESITATION_THRESHOLD_MS = 3_000;
export const PROMPT_THRESHOLD_MS = 5_000;
export const FINAL_TOKEN_AUTO_FINISH_PAUSE_MS = 900;

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
